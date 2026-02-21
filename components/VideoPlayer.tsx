'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Lock, Unlock, Volume2, Sun, Play, Pause, RotateCcw, RotateCw, Maximize, Settings, ChevronLeft } from 'lucide-react';
import { Movie } from '../types';
import { fetchMovieById } from '../services/firebaseService';

interface VideoPlayerProps {
  movieId: string;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ movieId, onClose }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [aspectRatioMode, setAspectRatioMode] = useState<'Fit' | 'Fill' | 'Original' | 'Stretch' | '16:9'>('Fit');
  const [isLocked, setIsLocked] = useState(false);
  const [brightness, setBrightness] = useState(1);
  const [gestureInfo, setGestureInfo] = useState<{ type: 'volume' | 'brightness', value: number, visible: boolean }>({ type: 'volume', value: 0, visible: false });
  const [seekGesture, setSeekGesture] = useState<{ side: 'left' | 'right', visible: boolean }>({ side: 'left', visible: false });
  const [accumulatedSeek, setAccumulatedSeek] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('0 KB/s');

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number, y: number, value: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const seekDebounceRef = useRef<number | null>(null);
  const lastBufferedRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await fetchMovieById(movieId);
      setMovie(data);
      setLoading(false);
    };
    loadData();
  }, [movieId]);

  const hideControls = useCallback(() => {
    if (isPlaying || isBuffering) {
      setShowControls(false);
    }
  }, [isPlaying, isBuffering]);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    if (!isLocked) {
      controlsTimeoutRef.current = window.setTimeout(hideControls, 4000);
    }
  }, [hideControls, isLocked]);

  const seek = useCallback((amount: number) => {
    if (isLocked || !videoRef.current) return;
    
    const newTime = Math.min(Math.max(videoRef.current.currentTime + amount, 0), duration);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    const side = amount > 0 ? 'right' : 'left';
    setAccumulatedSeek(prev => {
      if (seekGesture.visible && seekGesture.side === side) return prev + amount;
      return amount;
    });
    setSeekGesture({ side, visible: true });

    if (seekDebounceRef.current) window.clearTimeout(seekDebounceRef.current);
    seekDebounceRef.current = window.setTimeout(() => {
      setSeekGesture(prev => ({ ...prev, visible: false }));
      setAccumulatedSeek(0);
    }, 800);

    resetControlsTimeout();
  }, [resetControlsTimeout, isLocked, seekGesture.visible, seekGesture.side, duration]);

  const toggleControls = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) {
      resetControlsTimeout();
      return;
    }

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const isRightSide = x > rect.width / 2;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      seek(isRightSide ? 10 : -10);
      setShowControls(false);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
      lastTapRef.current = now;
      return;
    }
    lastTapRef.current = now;

    if (showControls) {
      setShowControls(false);
    } else {
      resetControlsTimeout();
    }
  };

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLocked) {
      resetControlsTimeout();
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout, isLocked]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    resetControlsTimeout();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) videoRef.current.playbackRate = speed;
    resetControlsTimeout();
  };

  const cyclePlaybackSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    const speeds = [1, 1.25, 1.5, 2, 0.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    handleSpeedChange(speeds[nextIndex]);
  };

  const cycleAspectRatio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;
    const modes: ('Fit' | 'Fill' | 'Original' | 'Stretch' | '16:9')[] = ['Fit', 'Fill', 'Original', 'Stretch', '16:9'];
    const currentIndex = modes.indexOf(aspectRatioMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setAspectRatioMode(modes[nextIndex]);
    resetControlsTimeout();
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return h > 0 
      ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}` 
      : `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.duration > 0) {
      const buffered = videoRef.current.buffered;
      const now = Date.now();
      const timeDiff = (now - lastTimeRef.current) / 1000;

      if (buffered.length > 0) {
        const total = videoRef.current.duration;
        const currentBufferEnd = buffered.end(buffered.length - 1);
        
        if (timeDiff >= 0.8) {
          const bufferedDiff = currentBufferEnd - lastBufferedRef.current;
          const estimatedBytes = Math.max(0, bufferedDiff * 500 * 1024);
          const speedBps = estimatedBytes / timeDiff;
          
          if (speedBps > 1024 * 1024) {
            setDownloadSpeed(`${(speedBps / (1024 * 1024)).toFixed(1)} MB/s`);
          } else if (speedBps > 0) {
            setDownloadSpeed(`${(speedBps / 1024).toFixed(0)} KB/s`);
          } else {
            setDownloadSpeed('0 KB/s');
          }
          
          lastBufferedRef.current = currentBufferEnd;
          lastTimeRef.current = now;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#030812] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) return null;
  const videoSource = movie.video_url || FALLBACK_VIDEO;
  const progressPercent = (currentTime / duration) * 100 || 0;

  const getAspectRatioClass = () => {
    switch (aspectRatioMode) {
      case 'Fit': return 'object-contain';
      case 'Fill': return 'object-cover';
      case 'Original': return 'object-none';
      case 'Stretch': return 'object-fill';
      case '16:9': return 'aspect-video object-cover';
      default: return 'object-contain';
    }
  };

  return (
    <div 
      ref={playerRef}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden select-none"
      onMouseMove={resetControlsTimeout}
      onClick={toggleControls}
    >
      <video
        ref={videoRef}
        src={videoSource}
        className={`w-full h-full transition-all duration-300 ${getAspectRatioClass()}`}
        style={{ filter: `brightness(${0.5 + brightness})` }}
        playsInline
        autoPlay
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onProgress={handleProgress}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
            if (videoRef.current && videoRef.current.src !== FALLBACK_VIDEO) {
                videoRef.current.src = FALLBACK_VIDEO;
                videoRef.current.load();
                videoRef.current.play();
            }
        }}
      />

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between bg-black/20 transition-opacity duration-300 ${showControls || isBuffering ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="w-full px-6 pt-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={28} />
            </button>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight truncate max-w-[60vw] italic">
                {movie.title}
              </h2>
              <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">{movie.quality_name || '1080P FHD'}</span>
            </div>
          </div>
        </div>

        {/* Center Controls */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-12 pointer-events-auto">
            {!isLocked && (
              <button onClick={(e) => { e.stopPropagation(); seek(-10); }} className="text-white/60 hover:text-white transition-all transform active:scale-90">
                <RotateCcw size={48} strokeWidth={1.5} />
              </button>
            )}

            <div className="relative">
              {isBuffering ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-white/10 border-t-[#E50914] rounded-full animate-spin" />
                  <span className="text-white text-[10px] font-black tracking-widest">{downloadSpeed}</span>
                </div>
              ) : !isLocked && (
                <button onClick={togglePlay} className="text-white transform hover:scale-110 active:scale-90 transition-all">
                  {isPlaying ? <Pause size={80} fill="currentColor" /> : <Play size={80} fill="currentColor" className="ml-2" />}
                </button>
              )}
            </div>

            {!isLocked && (
              <button onClick={(e) => { e.stopPropagation(); seek(10); }} className="text-white/60 hover:text-white transition-all transform active:scale-90">
                <RotateCw size={48} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="w-full px-6 pb-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="relative w-full mb-4 group cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[#E50914] rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <input 
              type="range" min="0" max={duration || 100} value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (videoRef.current) videoRef.current.currentTime = val;
              }}
              className="absolute inset-x-0 -top-4 w-full h-10 opacity-0 cursor-pointer z-30"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={togglePlay} className="text-white hover:text-[#E50914] transition-colors">
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>
              <div className="text-white/80 text-xs font-bold tabular-nums">
                <span className="text-[#E50914]">{formatTime(currentTime)}</span>
                <span className="mx-1 text-white/20">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={cyclePlaybackSpeed} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest">
                {playbackSpeed}x
              </button>
              <button onClick={cycleAspectRatio} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest">
                {aspectRatioMode}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsLocked(!isLocked); }} className={`p-2 rounded-full transition-all ${isLocked ? 'bg-[#E50914] text-white' : 'text-white/40 hover:text-white'}`}>
                {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
