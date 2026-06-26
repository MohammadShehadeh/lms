export function takeFirstOrNull<TData>(data: TData[]) {
  return data[0] ?? null;
}

const POSTGRES_ERROR_CODES = {
  "23505": "unique_violation",
} as const;

type PostgresErrorType = (typeof POSTGRES_ERROR_CODES)[keyof typeof POSTGRES_ERROR_CODES];

/**
 * True when `error` (or its `.cause`, since drizzle wraps driver errors) is a
 * Postgres error of the given type, e.g. `"unique_violation"`.
 */
export function checkPostgresErrorCode(error: unknown, type: PostgresErrorType) {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  let errorCode: unknown;
  if (
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause
  ) {
    errorCode = error.cause.code;
  } else if ("code" in error) {
    errorCode = (error as { code: string }).code;
  }

  return (
    typeof errorCode === "string" &&
    errorCode in POSTGRES_ERROR_CODES &&
    POSTGRES_ERROR_CODES[errorCode as keyof typeof POSTGRES_ERROR_CODES] === type
  );
}
