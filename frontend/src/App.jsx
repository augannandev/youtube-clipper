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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Download className="text-primary-600" size={32} />
            <span>YouTube Clipper</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Download custom clips from YouTube videos with precise timestamp selection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        
        {/* URL Input Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Link size={20} />
            <span>Enter YouTube URL</span>
          </h2>
          
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="input-field"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              Load Video
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
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
              <Download size={20} />
              <span>Download Clip</span>
            </h2>

            {/* Clip Info */}
            {startTime && endTime && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{(() => {
                        const duration = calculateDuration(startTime, endTime);
                        return `${duration.minutes}m ${duration.seconds}s`;
                      })()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Estimated Size:</span>
                    <div>~{estimatedSize()}MB</div>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Quality:</span>
                    <div>Up to 4K (2160p)</div>
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
                className="btn-primary flex items-center space-x-2 text-lg px-8 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Clip</span>
                  </>
                )}
              </button>
            </div>

            {isLoading && (
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  This may take a few minutes depending on video length...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
            <li>Paste a YouTube URL and click "Load Video"</li>
            <li>Use the player controls to navigate to your desired start time</li>
            <li>Click "Set Start Time" to mark the beginning of your clip</li>
            <li>Navigate to your desired end time and click "Set End Time"</li>
            <li>Click "Download Clip" to generate and download your custom video</li>
          </ol>
          <p className="text-blue-600 text-xs mt-3">
            ⚠️ Maximum clip duration: 45 minutes • Supported quality: up to 4K (2160p)
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 