import type {
  RedisClientType,
  RedisDefaultModules,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";
import { createClient } from "redis";
import superjson from "superjson";
import { cacheEnv } from "../env";

const env = cacheEnv();

type RedisClient = RedisClientType<
  RedisDefaultModules & RedisModules,
  RedisFunctions,
  RedisScripts
>;

/** Default TTL for cached values, in seconds. */
const DEFAULT_TTL_SECONDS = 3600 * 24;
/** Max time a caller waits for the initial connection before failing open. */
const CONNECT_TIMEOUT_MS = 2_000;
/** After a failed/timed-out connect, skip new attempts for this long. */
const RETRY_COOLDOWN_MS = 30_000;
/** Throttle for client error logs — reconnect loops fire one per attempt. */
const ERROR_LOG_INTERVAL_MS = 30_000;

export class Redis {
  // Values are serialized with superjson so Date/Map/Set survive the
  // round-trip with their types intact (plain JSON would stringify them).
  private client: RedisClient;
  private connecting: Promise<void> | null = null;
  private unavailableUntil = 0;
  private lastErrorLogAt = 0;
  private static instance: Redis | null = null;

  private constructor() {
    // Commands must not queue while disconnected — they reject immediately
    // so callers fail open instead of stalling.
    this.client = createClient({
      url: env.REDIS_CONNECTION_STRING,
      disableOfflineQueue: true,
      socket: {
        connectTimeout: CONNECT_TIMEOUT_MS,
        reconnectStrategy: (retries: number) => Math.min(retries * 100, 5000),
      },
    });

    this.client.on("error", (err) => {
      const now = Date.now();
      if (now - this.lastErrorLogAt >= ERROR_LOG_INTERVAL_MS) {
        this.lastErrorLogAt = now;
        console.error("Redis Client Error:", err);
      }
    });
  }

  public static getInstance(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }

  isReady(): boolean {
    return this.client.isReady;
  }

  /**
   * Opens the connection if it isn't already; safe to call concurrently.
   * Bounded: rejects after CONNECT_TIMEOUT_MS instead of waiting on the
   * client's endless reconnect loop, then skips new attempts for
   * RETRY_COOLDOWN_MS so requests fail open instantly while Redis is down.
   * The underlying client keeps reconnecting in the background; once it
   * becomes ready, callers are served again without intervention.
   */
  async connect(): Promise<void> {
    if (this.client.isReady) {
      this.unavailableUntil = 0;
      return;
    }

    const now = Date.now();
    if (now < this.unavailableUntil) {
      throw new Error("Redis is unavailable (cooling down after a failed connect)");
    }

    if (!this.connecting) {
      if (this.client.isOpen) {
        // Socket is open but not ready — a background reconnect is in
        // flight. Don't wait on it; fail open until it completes.
        this.unavailableUntil = now + RETRY_COOLDOWN_MS;
        throw new Error("Redis connection is not ready (reconnect in progress)");
      }
      this.connecting = this.client
        .connect()
        .then(() => undefined)
        .finally(() => {
          this.connecting = null;
        });
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        this.connecting,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Redis connect timed out after ${CONNECT_TIMEOUT_MS}ms`)),
            CONNECT_TIMEOUT_MS
          );
        }),
      ]);
      this.unavailableUntil = 0;
    } catch (error) {
      this.unavailableUntil = Date.now() + RETRY_COOLDOWN_MS;
      throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL_SECONDS): Promise<void> {
    if (!this.client.isReady) return;
    try {
      await this.client.setEx(key, ttlSeconds, superjson.stringify(value));
    } catch (error) {
      console.error("Error setting value in cache:", error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client.isReady) return null;
    try {
      const value = await this.client.get(key);
      if (value === null) return null;
      return superjson.parse<T>(value);
    } catch (error) {
      console.error("Error getting value from cache:", error);
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client.isReady) return 0;
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("Error deleting key:", error);
      return 0;
    }
  }

  /**
   * Read-through cache: returns the cached value for `key`, or runs `fn` and
   * caches its result. Fails open — if Redis is unreachable, `fn` runs
   * directly (connect failures surface via the client's throttled error log).
   */
  async wrapWithCache<T>(fn: () => Promise<T>, options: { key: string; ttl?: number }): Promise<T> {
    const { key, ttl = DEFAULT_TTL_SECONDS } = options;
    await this.connect().catch(() => undefined);
    const value = await this.get<T>(key);
    if (value !== null) return value;
    const result = await fn();
    await this.set(key, result, ttl);
    return result;
  }

  async multi(): Promise<ReturnType<RedisClient["multi"]> | null> {
    if (!this.client.isReady) return null;
    try {
      return this.client.multi();
    } catch (error) {
      console.error("Error creating pipeline:", error);
      return null;
    }
  }
}
