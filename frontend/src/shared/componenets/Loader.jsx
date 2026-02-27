const FintechFullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </div>
    </div>
  );
};

export default FintechFullPageLoader;
