import { useCallback, useState } from "react";

export interface UseHistoryResult<T> {
  state: T;
  /** Set the next state, like React's setState */
  setState: (next: T | ((prev: T) => T)) => void;
  /** Push a brand-new state, with option to overwrite history (for reset-style actions). */
  update: (next: T, overwrite?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface HistoryBuckets<T> {
  past: T[];
  present: T;
  future: T[];
}

const DEFAULT_CAPACITY = 50;

/**
 * Small helper to keep an undo / redo history for any serialisable value.
 * Think of it as a light wrapper around useState with extra past / future stacks.
 */
function useHistory<T>(initial: T, capacity: number = DEFAULT_CAPACITY): UseHistoryResult<T> {
  const [history, setHistory] = useState<HistoryBuckets<T>>({
    past: [],
    present: initial,
    future: [],
  });

  // Push a brand-new state and clear "future" (like normal undo stacks)
  const update = useCallback(
    (next: T, overwrite: boolean = false) => {
      setHistory((prev) => {
        const past = overwrite
          ? prev.past
          : [...prev.past, prev.present].slice(-capacity);

        return {
          past,
          present: next,
          future: [],
        };
      });
    },
    [capacity]
  );

  // React-style setState: accepts value OR updater function
  const setState: UseHistoryResult<T>["setState"] = useCallback(
    (next) => {
      setHistory((prev) => {
        const current = prev.present;
        const resolvedNext =
          typeof next === "function"
            ? (next as (p: T) => T)(current)
            : next;

        // If nothing changed, don't add a history entry
        if (Object.is(resolvedNext, current)) {
          return prev;
        }

        return {
          past: [...prev.past, current].slice(-capacity),
          present: resolvedNext,
          future: [],
        };
      });
    },
    [capacity]
  );

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future].slice(0, capacity),
      };
    });
  }, [capacity]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      return {
        past: [...prev.past, prev.present].slice(-capacity),
        present: next,
        future: newFuture,
      };
    });
  }, [capacity]);

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  return {
    state: history.present,
    setState,
    update,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

export default useHistory;
