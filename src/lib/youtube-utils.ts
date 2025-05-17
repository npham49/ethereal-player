/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;

  // Handle regular YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return match[2];
  }

  // Handle youtu.be URLs
  const shortRegExp = /^.*(youtu.be\/)([^#&?]*).*/;
  const shortMatch = url.match(shortRegExp);

  if (shortMatch && shortMatch[2].length === 11) {
    return shortMatch[2];
  }

  return null;
};

/**
 * Validate if a URL is a valid YouTube URL
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  return !!extractYoutubeVideoId(url);
};

/**
 * Get thumbnail URL for a YouTube video
 */
export const getYoutubeThumbnailUrl = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Format seconds into MM:SS format
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
