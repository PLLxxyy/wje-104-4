import { useCallback, useMemo, useRef, useState } from "react";
import { HISTORY_LIMITS } from "../constants/app";

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface HistoryControls<T> {
  pushState: (nextState: T) => void;
  undo: () => T | undefined;
  redo: () => T | undefined;
  canUndo: boolean;
  canRedo: boolean;
  clear: (nextState?: T) => void;
}

export const useHistory = <T,>(initialState: T, maxSteps = HISTORY_LIMITS.maxSteps): HistoryControls<T> => {
  const historyRef = useRef<HistoryState<T>>({
    past: [],
    present: initialState,
    future: []
  });
  const [, setVersion] = useState(0);

  const commitHistory = useCallback((nextHistory: HistoryState<T>): void => {
    historyRef.current = nextHistory;
    setVersion((version) => version + 1);
  }, []);

  const pushState = useCallback(
    (nextState: T): void => {
      const current = historyRef.current;
      commitHistory({
        past: [...current.past, current.present].slice(-maxSteps),
        present: nextState,
        future: []
      });
    },
    [commitHistory, maxSteps]
  );

  const undo = useCallback((): T | undefined => {
    const current = historyRef.current;
    if (current.past.length === 0) {
      return undefined;
    }
    const previous = current.past[current.past.length - 1];
    commitHistory({
      past: current.past.slice(0, -1),
      present: previous,
      future: [current.present, ...current.future]
    });
    return previous;
  }, [commitHistory]);

  const redo = useCallback((): T | undefined => {
    const current = historyRef.current;
    if (current.future.length === 0) {
      return undefined;
    }
    const next = current.future[0];
    commitHistory({
      past: [...current.past, current.present].slice(-maxSteps),
      present: next,
      future: current.future.slice(1)
    });
    return next;
  }, [commitHistory, maxSteps]);

  const clear = useCallback(
    (nextState?: T): void => {
      const current = historyRef.current;
      commitHistory({
        past: [],
        present: nextState ?? current.present,
        future: []
      });
    },
    [commitHistory]
  );

  const history = historyRef.current;
  return useMemo(
    () => ({
      pushState,
      undo,
      redo,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      clear
    }),
    [clear, history.future.length, history.past.length, pushState, redo, undo]
  );
};
