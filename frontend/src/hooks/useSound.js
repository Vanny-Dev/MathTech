import { useRef } from 'react';

const useSound = () => {
  const sounds = useRef({});

  const preload = (name, src) => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    sounds.current[name] = audio;
  };

  const play = (name) => {
    const audio = sounds.current[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // suppress autoplay errors
    }
  };

  return { preload, play };
};

export default useSound;
