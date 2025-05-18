import { useState, useEffect, useRef } from "react";
import { extractYoutubeVideoId } from "../lib/youtube-utils";
import { toast } from "sonner";

// Define YouTube Player States
enum PlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

interface UseYouTubePlayerProps {
  initialUrl?: string;
}

interface YoutubePlayerState {
  player: any | null; // YouTube Player instance
  videoId: string | null;
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isMuted: boolean;
  volume: number;
  isBuffering: boolean;
}

declare global {
  interface Window {
    repeat: boolean | undefined;
    YT: {
      Player: any;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// TODO: Move all of this into a global state,
export const useYouTubePlayer = ({
  initialUrl,
}: UseYouTubePlayerProps = {}) => {
  const playerRef = useRef<any | null>(null);
  const playerElementRef = useRef<HTMLDivElement | null>(null);

  const [ytState, setYtState] = useState<YoutubePlayerState>({
    player: null,
    videoId: initialUrl ? extractYoutubeVideoId(initialUrl) : null,
    isReady: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isMuted: false,
    volume: 100,
    isBuffering: false,
  });

  const [videoUrl, setVideoUrl] = useState<string>(initialUrl || "");

  // Load the YouTube API script
  useEffect(() => {
    // Check if the YouTube API script is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Create the script element to load the YouTube API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";

    // Get the first script tag on the page and insert our script before it
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up the callback that the YouTube API will call when it's ready
    window.onYouTubeIframeAPIReady = initializePlayer;

    // Clean up
    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);

  // Function to initialize the YouTube Player
  const initializePlayer = () => {
    if (!playerElementRef.current) return;

    playerRef.current = new window.YT.Player(playerElementRef.current, {
      width: "1",
      height: "1",
      videoId: ytState.videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    });

    setYtState((prev) => ({ ...prev, player: playerRef.current }));
  };

  // Callback when the player is ready
  const onPlayerReady = (event: { target: { getDuration: () => number } }) => {
    setYtState((prev) => ({
      ...prev,
      isReady: true,
      duration: event.target.getDuration(),
    }));
  };

  // Callback when the player state changes
  const onPlayerStateChange = (event: { data: number }) => {
    const state = event.data;

    setYtState((prev) => ({
      ...prev,
      isPlaying: state === PlayerState.PLAYING,
      isBuffering: state === PlayerState.BUFFERING,
    }));

    // Update duration when video is loaded
    if (state === PlayerState.PLAYING || state === PlayerState.CUED) {
      const duration = playerRef.current.getDuration();
      setYtState((prev) => ({ ...prev, duration }));
    }

    // Handle video end
    if (state === PlayerState.ENDED) {
      if (!!window.repeat) {
        console.log("repeating video");
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
        setYtState((prev) => ({
          ...prev,
          isPlaying: true,
          currentTime: 0,
        }));
      } else {
        setYtState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
      }
    }
  };

  const onSetRepeat = (nrepeat: boolean) => {
    window.repeat = nrepeat;
  };

  // Callback for player errors
  const onPlayerError = () => {
    toast.error("Error playing video", {
      description: "There was an issue with the YouTube video.",
    });
  };

  // Update the current time periodically when playing
  useEffect(() => {
    if (!playerRef.current || !ytState.isPlaying) return;

    const interval = setInterval(() => {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime === "function"
      ) {
        const currentTime = playerRef.current.getCurrentTime();
        setYtState((prev) => ({ ...prev, currentTime }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ytState.isPlaying]);

  // Function to load a new video URL
  const loadVideo = (url: string) => {
    const videoId = extractYoutubeVideoId(url);

    if (!videoId) {
      toast.error("Invalid YouTube URL", {
        description: "Please enter a valid YouTube video URL.",
      });
      return false;
    }

    if (playerRef.current && ytState.isReady) {
      playerRef.current.loadVideoById(videoId);
      setYtState((prev) => ({
        ...prev,
        videoId,
        isPlaying: true,
        currentTime: 0,
      }));
    } else {
      setYtState((prev) => ({ ...prev, videoId }));
    }

    window.repeat = false;
    setVideoUrl(url);
    return true;
  };

  // Functions to control the player
  const play = () => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.playVideo();
      setYtState((prev) => ({ ...prev, isPlaying: true }));
    }
  };

  const pause = () => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.pauseVideo();
      setYtState((prev) => ({ ...prev, isPlaying: false }));
    }
  };

  const togglePlay = () => {
    if (ytState.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const skip = (seconds: number) => {
    if (playerRef.current && ytState.isReady) {
      const newTime = playerRef.current.getCurrentTime() + seconds;
      playerRef.current.seekTo(newTime, true);
      setYtState((prev) => ({ ...prev, currentTime: newTime }));
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.seekTo(seconds, true);
      setYtState((prev) => ({ ...prev, currentTime: seconds }));
    }
  };

  const mute = () => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.mute();
      setYtState((prev) => ({ ...prev, isMuted: true }));
    }
  };

  const unmute = () => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.unMute();
      setYtState((prev) => ({ ...prev, isMuted: false }));
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current && ytState.isReady) {
      playerRef.current.setVolume(volume);
      setYtState((prev) => ({ ...prev, volume }));
    }
  };

  // Clean up the player when component unmounts
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  return {
    playerElementRef,
    videoUrl,
    setVideoUrl,
    loadVideo,
    play,
    pause,
    togglePlay,
    skip,
    seekTo,
    mute,
    unmute,
    setVolume,
    onSetRepeat,
    isReady: ytState.isReady,
    isPlaying: ytState.isPlaying,
    isBuffering: ytState.isBuffering,
    currentTime: ytState.currentTime,
    duration: ytState.duration,
    isMuted: ytState.isMuted,
    volume: ytState.volume,
    videoId: ytState.videoId,
  };
};
