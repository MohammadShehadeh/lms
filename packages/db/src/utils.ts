export function takeFirstOrNull<TData>(data: TData[]) {
  return data[0] ?? null;
}
