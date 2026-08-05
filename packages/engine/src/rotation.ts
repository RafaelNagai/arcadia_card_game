import type { Rotation } from './types';

/** Each 90° turn shifts the arrow pattern two positions in the index. */
export function effectiveArrows(arrows: boolean[], rot: Rotation): boolean[] {
  const out = new Array<boolean>(8).fill(false);
  for (let i = 0; i < 8; i++) {
    if (arrows[i]) out[(i + rot * 2) % 8] = true;
  }
  return out;
}
