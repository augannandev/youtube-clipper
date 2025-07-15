/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Convert seconds to HH:MM:SS format
 */
export function secondsToTimeString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Convert HH:MM:SS to seconds
 */
export function timeStringToSeconds(timeStr) {
  const parts = timeStr.split(':');
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url) {
  return extractVideoId(url) !== null;
}

/**
 * Calculate clip duration in minutes and seconds
 */
export function calculateDuration(startTime, endTime) {
  const startSeconds = timeStringToSeconds(startTime);
  const endSeconds = timeStringToSeconds(endTime);
  const duration = endSeconds - startSeconds;
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  return { minutes, seconds, totalSeconds: duration };
} 