import { useEffect, useRef } from "react";

export const useInterval = (cb, delay) => {
  const savedCB = useRef();

  //   Remember the latest callback
  useEffect(() => {
    savedCB.current = cb;
  }, [cb]);

  //   set up the interval
  useEffect(() => {
    const tick = () => {
      savedCB.current();
    };

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
