import React from "react";

interface YouTubeEmbedProps {
  playerRef: React.RefObject<HTMLDivElement>;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ playerRef }) => {
  return (
    <div className="youtube-hidden">
      <div ref={playerRef} id="youtube-player"></div>
    </div>
  );
};

export default YouTubeEmbed;
