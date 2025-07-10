import { useState, useEffect } from 'react';

export const useAudio = () => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.3);
  const [audioCache, setAudioCache] = useState<Map<string, HTMLAudioElement>>(new Map());

  const playAudio = (name: string) => {
    if (isMuted) return;

    let audio = audioCache.get(name);

    if (!audio) {
      const formattedName = name.replace(/ /g, '%20');
      audio = new Audio(`${formattedName}.ogg`);
      audio.preload = 'auto';
      audio.volume = volume;

      setAudioCache(prev => new Map(prev).set(name, audio!));

      const playWhenReady = () => {
        audio!.currentTime = 0;
        audio!.volume = volume;
        audio!.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      };

      if (audio.readyState >= 2) {
        playWhenReady();
      } else {
        audio.addEventListener('loadeddata', playWhenReady, { once: true });
        audio.addEventListener('canplaythrough', playWhenReady, { once: true });
      }
    } else {
      audio.currentTime = 0;
      audio.volume = volume;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioCache.forEach(audio => {
      audio.volume = newVolume;
    });
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  useEffect(() => {
    audioCache.forEach(audio => {
      audio.volume = isMuted ? 0 : volume;
    });
  }, [isMuted, volume, audioCache]);

  return { isMuted, volume, playAudio, handleVolumeChange, toggleMute };
};
