import { useEffect, useRef } from "react";

export default function useInterval({
  callback,
  delay,
  fireOnFirstTime = false,
}: {
  callback: () => void;
  delay: number | null;
  fireOnFirstTime?: boolean;
}) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    if (delay === null) {
      return;
    }

    if (fireOnFirstTime) {
      savedCallback.current();
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay, fireOnFirstTime]);
}
