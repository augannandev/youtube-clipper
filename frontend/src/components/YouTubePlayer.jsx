import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { secondsToTimeString } from '../utils/youtube';

const YouTubePlayer = ({ videoId, onStartTimeSet, onEndTimeSet, startTime, endTime }) => {
  const playerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoId) return;

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    const initializePlayer = () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        width: '100%',
        height: '400',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event) => {
            setIsReady(true);
            setDuration(event.target.getDuration());
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startTimeTracking();
            } else {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initializePlayer();
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer;
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, [videoId]);

  const startTimeTracking = () => {
    const updateCurrentTime = () => {
      if (playerInstanceRef.current && playerInstanceRef.current.getCurrentTime) {
        const time = playerInstanceRef.current.getCurrentTime();
        setCurrentTime(time);
        
        if (isPlaying) {
          setTimeout(updateCurrentTime, 1000);
        }
      }
    };
    updateCurrentTime();
  };

  const handlePlayPause = () => {
    if (!isReady) return;
    
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  };

  const handleSeek = (seconds) => {
    if (!isReady) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    playerInstanceRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleSetStartTime = () => {
    if (!isReady) return;
    
    const time = playerInstanceRef.current.getCurrentTime();
    const timeString = secondsToTimeString(time);
    onStartTimeSet(timeString);
  };

  const handleSetEndTime = () => {
    if (!isReady) return;
    
    const time = playerInstanceRef.current.getCurrentTime();
    const timeString = secondsToTimeString(time);
    onEndTimeSet(timeString);
  };

  if (!videoId) {
    return (
      <div className="card-modern">
        <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🎥</div>
          <p className="text-gray-500 text-lg">Enter a YouTube URL to load the player</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern hover:shadow-2xl transition-all duration-300">
      <div className="mb-6">
        <div ref={playerRef} className="w-full rounded-2xl overflow-hidden shadow-xl" />
      </div>
      
      {/* Player Controls */}
      <div className="space-y-6">
        {/* Current Time Display */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg">
            <span className="text-xl font-mono font-bold">
              {secondsToTimeString(currentTime)} / {secondsToTimeString(duration)}
            </span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => handleSeek(-10)}
            disabled={!isReady}
            className="btn-control flex items-center space-x-2"
          >
            <SkipBack size={18} />
            <span>-10s</span>
          </button>
          
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="btn-play flex items-center space-x-2"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            <span className="font-semibold">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={() => handleSeek(10)}
            disabled={!isReady}
            className="btn-control flex items-center space-x-2"
          >
            <span>+10s</span>
            <SkipForward size={18} />
          </button>
        </div>

        {/* Timestamp Setting Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleSetStartTime}
            disabled={!isReady}
            className="btn-timestamp-start"
          >
            <span className="text-lg">📍</span>
            <span className="font-semibold">Set Start Time</span>
          </button>
          
          <button
            onClick={handleSetEndTime}
            disabled={!isReady}
            className="btn-timestamp-end"
          >
            <span className="text-lg">🏁</span>
            <span className="font-semibold">Set End Time</span>
          </button>
        </div>

        {/* Selected Times Display */}
        {(startTime || endTime) && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-inner">
            <h3 className="font-bold text-green-800 mb-3 text-lg">✅ Selected Times:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {startTime && (
                <div className="bg-white/70 p-3 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-1">Start Time</span>
                  <p className="text-lg font-mono font-bold text-green-700">{startTime}</p>
                </div>
              )}
              {endTime && (
                <div className="bg-white/70 p-3 rounded-lg">
                  <span className="text-sm text-gray-600 block mb-1">End Time</span>
                  <p className="text-lg font-mono font-bold text-green-700">{endTime}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer; 