import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Pause, Play, Repeat1, RotateCcw, RotateCw } from "lucide-react";
import YouTubeEmbed from "./youtube-embed";
import { useYouTubePlayer } from "../hooks/use-youtube-player";
import {
  getYoutubeThumbnailUrl,
  formatTime,
  isValidYoutubeUrl,
} from "../lib/youtube-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=jfKfPfyJRdk"; // Lofi hip hop radio

const MusicPlayer: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [showEqualizer, setShowEqualizer] = useState<boolean>(false);

  const {
    playerElementRef,
    videoUrl,
    loadVideo,
    isPlaying,
    isBuffering,
    togglePlay,
    skip,
    repeat,
    onSetRepeat,
    currentTime,
    duration,
    seekTo,
    videoId,
  } = useYouTubePlayer({ initialUrl: DEFAULT_VIDEO_URL });

  // Load the default video on first mount
  useEffect(() => {
    if (!videoUrl && !isActive) {
      handlePlayDefault();
    }
  }, []);

  // Update thumbnail when video ID changes
  useEffect(() => {
    if (videoId) {
      const thumbnail = getYoutubeThumbnailUrl(videoId);
      setThumbnailUrl(thumbnail);

      // Attempt to fetch video title (this would require a server in real app)
      // For now, just use a placeholder
      setVideoTitle("YouTube Music");
      setIsActive(true);
    }
  }, [videoId]);

  // Show/hide equalizer based on playing state
  useEffect(() => {
    setShowEqualizer(isPlaying && !isBuffering);
  }, [isPlaying, isBuffering]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputUrl.trim()) {
      toast.error("Empty URL", {
        description: "Please enter a YouTube URL.",
      });
      return;
    }

    if (!isValidYoutubeUrl(inputUrl)) {
      toast.error("Invalid URL", {
        description: "Please enter a valid YouTube video URL.",
      });
      return;
    }

    const success = loadVideo(inputUrl);
    if (success) {
      setInputUrl("");
      toast.success("Video loaded", {
        description: "Your music is now playing.",
      });
    }
  };

  const handlePlayDefault = () => {
    loadVideo(DEFAULT_VIDEO_URL);
    setInputUrl("");
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-none bg-transparent p-1 rounded-xl">
        {/* YouTube player (hidden) */}
        <YouTubeEmbed playerRef={playerElementRef} />

        {/* Video thumbnail and background */}
        {thumbnailUrl && (
          <div className="mb-2 rounded-lg overflow-hidden relative aspect-video">
            <div
              className="absolute inset-0 bg-center bg-cover blur-sm opacity-50 scale-110"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            ></div>
            <img
              src={thumbnailUrl}
              alt={videoTitle}
              className="relative z-10 w-full h-full object-cover rounded-lg"
            />

            {/* Equalizer overlay */}
            {showEqualizer && (
              <div className="absolute bottom-4 right-4 z-20 flex items-end">
                <div
                  className="equalizer-bar"
                  style={{ animationDelay: "0s" }}
                ></div>
                <div
                  className="equalizer-bar"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="equalizer-bar"
                  style={{ animationDelay: "0.5s" }}
                ></div>
                <div
                  className="equalizer-bar"
                  style={{ animationDelay: "0.1s" }}
                ></div>
              </div>
            )}
          </div>
        )}

        {/* Video title */}
        {videoTitle && (
          <div className="mb-2 text-center">
            <h3 className="text-lg font-medium text-white truncate">
              {videoTitle}
            </h3>
            <p className="text-sm text-white/60">Background Music Player</p>
          </div>
        )}

        {/* Progress bar */}
        <div>
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="my-4"
          />
          <div className="flex justify-between text-xs text-white/60">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex justify-center items-center space-x-4 mb-5">
          <button
            onClick={() => skip(-10)}
            className="music-control-button"
            aria-label="Skip backwards 10 seconds"
          >
            <RotateCcw size={22} />
          </button>

          <button
            onClick={togglePlay}
            className="music-control-button w-16 h-16 bg-music-primary hover:bg-music-primary/90"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>

          <button
            onClick={() => skip(10)}
            className="music-control-button"
            aria-label="Skip forward 10 seconds"
          >
            <RotateCw size={22} />
          </button>
          <button
            onClick={() => onSetRepeat(!repeat)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-full active:scale-95 transition-all",
              {
                "bg-white hover:bg-white/10 text-black": repeat,
                "bg-white/10 text-white hover:bg-white/20": !repeat,
              }
            )}
            style={{
              backgroundColor: repeat ? "white" : "rgba(255, 255, 255, 0.1)",
              color: repeat ? "black" : "white",
            }}
            aria-label="Repeat"
          >
            <Repeat1 size={22} />
          </button>
        </div>

        {/* URL input form */}
        <form onSubmit={handleSubmit} className="mt-2">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={inputUrl}
              onChange={handleInputChange}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <Button
              type="submit"
              className="bg-music-primary hover:bg-music-primary/90"
            >
              Play
            </Button>
          </div>
        </form>

        {/* Default music button */}
        <div className="mt-2 text-center">
          <button
            onClick={handlePlayDefault}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Play lofi beats
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
