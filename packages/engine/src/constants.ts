// 0=N  1=NE  2=E  3=SE  4=S  5=SW  6=W  7=NW
export const OFFSET: [number, number][] = [
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, -1],
];

export const opposite = (d: number): number => (d + 4) % 8;
