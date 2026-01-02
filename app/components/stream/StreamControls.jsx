'use client';

/**
 * StreamControls Component
 * Handles media controls for streaming: video file selection, screen share, camera, etc.
 */
export function StreamControls({
  onFileSelected,
  onStartStreaming,
  onStartScreenShare,
  onStartCamera,
  onFlipCamera,
  onStopAllStreams,
  isStreaming,
  isScreenSharing,
  isCameraActive,
  availableCameras = []
}) {
  return (
    <div className="comic-panel p-8 h-full relative overflow-hidden hover-lift">
      <h2 className="text-3xl font-black mb-6 inline-block bg-[var(--color-pastel-pink)] border-3 border-ink px-4 py-2 shadow-[4px_4px_0px_0px_var(--color-ink)] transform rotate-1">
        Action!
      </h2>
      
      <div className="space-y-6">
        <div className="bg-[var(--color-paper)] p-4 rounded-xl border-3 border-ink border-dashed hover-lift">
          <label className="block font-bold text-xl mb-3">Select Video</label>
          <input 
            type="file" 
            accept="video/*" 
            onChange={onFileSelected}
            className="relative z-10 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-3 file:border-ink file:text-lg file:font-bold file:bg-[var(--color-pastel-yellow)] hover:file:bg-[var(--color-pastel-peach)] file:text-[var(--color-ink)] cursor-pointer w-full text-sm file:cursor-pointer transition-all duration-200"
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={onStartStreaming}
            disabled={isStreaming} 
            className={`btn-comic w-full text-xl py-4 ${isStreaming ? 'opacity-50 bg-gray-200' : 'primary'}`}
          >
            {isStreaming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                On Air...
              </span>
            ) : 'Start Video Stream'}
          </button>
          
          <div className="text-center font-bold text-gray-400 opacity-50">— OR —</div>

          <button 
            onClick={onStartScreenShare}
            className="btn-comic w-full text-xl py-4 secondary"
          >
            {isScreenSharing ? 'Screen Sharing...' : 'Share Screen + Mic'}
          </button>

          <button 
            onClick={onStartCamera}
            className="btn-comic w-full text-xl py-4 secondary"
          >
            {isCameraActive ? 'Camera Active...' : 'Start Camera'}
          </button>

          {isCameraActive && availableCameras.length > 1 && (
            <button 
              onClick={onFlipCamera}
              className="btn-comic w-full text-lg py-3 secondary"
            >
              Flip Camera
            </button>
          )}

          {isStreaming && (
            <button 
              onClick={onStopAllStreams}
              className="btn-comic w-full text-xl py-4 danger"
            >
              Stop Streaming
            </button>
          )}
        </div>
      </div>
    </div>
  );
}