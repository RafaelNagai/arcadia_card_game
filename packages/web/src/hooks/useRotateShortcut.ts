import { useEffect, type Dispatch } from 'react';
import type { Action, Selection } from '../reducer/types';

export function useRotateShortcut(selection: Selection | null, dispatch: Dispatch<Action>): void {
  useEffect(() => {
    if (!selection || selection.mode !== 'main-hand') return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === 'r') {
        dispatch({ type: 'ROTATE' });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selection, dispatch]);
}
