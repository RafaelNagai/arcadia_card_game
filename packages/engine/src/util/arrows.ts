export function arrowsFrom(indices: number[]): boolean[] {
  const out = new Array(8).fill(false);
  for (const i of indices) out[i] = true;
  return out;
}
