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
      <div className="card">
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Enter a YouTube URL to load the player</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4">
        <div ref={playerRef} className="w-full rounded-lg overflow-hidden" />
      </div>
      
      {/* Player Controls */}
      <div className="space-y-4">
        {/* Current Time Display */}
        <div className="text-center">
          <span className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
            {secondsToTimeString(currentTime)} / {secondsToTimeString(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => handleSeek(-10)}
            disabled={!isReady}
            className="btn-secondary flex items-center space-x-1"
          >
            <SkipBack size={16} />
            <span>-10s</span>
          </button>
          
          <button
            onClick={handlePlayPause}
            disabled={!isReady}
            className="btn-primary flex items-center space-x-1"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button
            onClick={() => handleSeek(10)}
            disabled={!isReady}
            className="btn-secondary flex items-center space-x-1"
          >
            <span>+10s</span>
            <SkipForward size={16} />
          </button>
        </div>

        {/* Timestamp Setting Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleSetStartTime}
            disabled={!isReady}
            className="btn-primary"
          >
            Set Start Time
          </button>
          
          <button
            onClick={handleSetEndTime}
            disabled={!isReady}
            className="btn-primary"
          >
            Set End Time
          </button>
        </div>

        {/* Selected Times Display */}
        {(startTime || endTime) && (
          <div className="bg-primary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-primary-700 mb-2">Selected Times:</h3>
            <div className="space-y-1">
              {startTime && (
                <p><span className="font-medium">Start:</span> {startTime}</p>
              )}
              {endTime && (
                <p><span className="font-medium">End:</span> {endTime}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubePlayer; 