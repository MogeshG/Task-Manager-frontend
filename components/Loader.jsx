const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "fixed inset-0 bg-white/70 backdrop-blur-sm z-50" : ""
      }`}
    >
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

export default Loader;
