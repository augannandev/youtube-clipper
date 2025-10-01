import React, { useState } from 'react';
import { Download, Link, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import YouTubePlayer from './components/YouTubePlayer';
import { extractVideoId, isValidYouTubeUrl, calculateDuration } from './utils/youtube';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const id = extractVideoId(url);
    setVideoId(id);
    setStartTime('');
    setEndTime('');
  };

  const handleDownload = async () => {
    if (!startTime || !endTime) {
      setError('Please set both start and end times');
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    
    if (duration.totalSeconds <= 0) {
      setError('End time must be after start time');
      return;
    }

    if (duration.totalSeconds > 2700) { // 45 minutes
      setError(`Clip duration cannot exceed 45 minutes. Current duration: ${duration.minutes}m ${duration.seconds}s`);
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/clip', {
        url: url,
        start_time: startTime,
        end_time: endTime,
      }, {
        responseType: 'blob',
        timeout: 300000, // 5 minutes timeout
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Generate filename
      const filename = `youtube-clip-${startTime.replace(/:/g, '-')}-to-${endTime.replace(/:/g, '-')}.mp4`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setSuccess(`Clip downloaded successfully! Duration: ${duration.minutes}m ${duration.seconds}s`);
    } catch (err) {
      console.error('Download error:', err);
      
      if (err.response?.data) {
        try {
          const errorText = await err.response.data.text();
          const errorData = JSON.parse(errorText);
          setError(errorData.detail || 'Failed to download clip');
        } catch {
          setError('Failed to download clip. Please try again.');
        }
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. The video might be too long or the server is busy.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedSize = () => {
    if (!startTime || !endTime) return null;
    
    const duration = calculateDuration(startTime, endTime);
    if (duration.totalSeconds <= 0) return null;
    
    // Rough estimate: ~8-10MB per minute for high quality video (varies by resolution)
    const estimatedMB = Math.round((duration.totalSeconds / 60) * 8);
    return estimatedMB;
  };

  const canDownload = videoId && startTime && endTime && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Download className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold">YouTube Clipper</h1>
          </div>
          <p className="text-indigo-100 text-lg">
            ✨ Create and download custom clips from any YouTube video with precision
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        
        {/* URL Input Section */}
        <div className="card-modern group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <Link size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Enter YouTube URL
            </h2>
          </div>
          
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your YouTube link here (e.g., https://www.youtube.com/watch?v=...)"
                className="input-field-modern"
                disabled={isLoading}
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gradient w-full sm:w-auto"
            >
              🎬 Load Video
            </button>
          </form>
        </div>

        {/* Video Player Section */}
        <YouTubePlayer
          videoId={videoId}
          onStartTimeSet={setStartTime}
          onEndTimeSet={setEndTime}
          startTime={startTime}
          endTime={endTime}
        />

        {/* Download Section */}
        {videoId && (
          <div className="card-modern hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Download size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Download Your Clip
              </h2>
            </div>

            {/* Clip Info */}
            {startTime && endTime && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl mb-6 border border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center md:text-left">
                    <div className="text-sm font-medium text-gray-600 mb-2">⏱️ Duration</div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-lg font-bold text-indigo-700">
                      <Clock size={18} />
                      <span>{(() => {
                        const duration = calculateDuration(startTime, endTime);
                        return `${duration.minutes}m ${duration.seconds}s`;
                      })()}</span>
                    </div>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="text-sm font-medium text-gray-600 mb-2">💾 Est. Size</div>
                    <div className="text-lg font-bold text-purple-700">~{estimatedSize()} MB</div>
                  </div>
                  
                  <div className="text-center md:text-left">
                    <div className="text-sm font-medium text-gray-600 mb-2">🎬 Quality</div>
                    <div className="text-lg font-bold text-pink-700">Up to 4K</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="text-red-500 mt-0.5" size={16} />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success Display */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 mt-0.5" size={16} />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Download Button */}
            <div className="flex justify-center">
              <button
                onClick={handleDownload}
                disabled={!canDownload}
                className="btn-gradient-large group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  {isLoading ? (
                    <>
                      <Loader2 className="spinner" size={24} />
                      <span className="text-xl">Processing Your Clip...</span>
                    </>
                  ) : (
                    <>
                      <Download size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xl font-bold">Download Clip</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </div>

            {isLoading && (
              <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="inline-block animate-pulse">
                  <p className="text-blue-700 font-medium">
                    ⚡ Processing your video... This may take 1-3 minutes
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="card-modern bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="text-xl font-bold text-blue-800">Quick Guide</h3>
          </div>
          <ol className="space-y-3 text-blue-700">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Paste a YouTube URL and click <strong>"Load Video"</strong></span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Use player controls to find your <strong>start time</strong></span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Click <strong>"Set Start Time"</strong> to mark the beginning</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Navigate to your <strong>end time</strong> and set it</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              <span>Hit <strong>"Download Clip"</strong> and get your video! 🎉</span>
            </li>
          </ol>
          <div className="mt-6 p-3 bg-white/60 rounded-lg">
            <p className="text-blue-800 text-sm font-medium">
              ⚠️ Max duration: <strong>45 minutes</strong> • Quality: <strong>Up to 4K (2160p)</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 