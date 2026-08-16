import { useState, useEffect, useRef } from 'react';

const useTimer = (initialSeconds = 0, autoStart = true) => {
  const [seconds, setSeconds]   = useState(initialSeconds);
  const [running, setRunning]   = useState(autoStart);
  const intervalRef             = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const stop  = () => setRunning(false);
  const reset = () => { setSeconds(0); setRunning(false); };

  const format = () => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return { seconds, running, stop, reset, format };
};

export default useTimer;
