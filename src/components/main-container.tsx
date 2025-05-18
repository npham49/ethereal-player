import MusicPlayer from "./music-player";
const MainContainer = () => {
  // get current container's dimensions
  const container = document.querySelector(".main-container");
  const containerWidth = container?.clientWidth;
  const containerHeight = container?.clientHeight;

  return (
    <div
      className="main-container min-h-screen w-full flex items-center justify-center bg-black p-4"
      style={{ width: containerWidth, height: containerHeight }}
    >
      <MusicPlayer />
    </div>
  );
};

export default MainContainer;
