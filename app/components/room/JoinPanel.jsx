'use client';

/**
 * JoinPanel Component
 * Handles room joining UI with room ID and display name inputs
 */
export function JoinPanel({
  roomId,
  setRoomId,
  displayName,
  setDisplayName,
  joined,
  onJoin,
  onLeave
}) {
  return (
    <div className="comic-panel p-8 h-full relative overflow-hidden hover-lift">
      <h2 className="text-4xl font-black mb-6 inline-block transform -rotate-2 bg-[var(--color-pastel-yellow)] px-4 py-2 border-3 border-ink shadow-[4px_4px_0px_0px_var(--color-ink)]">
        Identity
      </h2>
      
      <div className="space-y-6">
        <div>
          <label className="block font-bold text-xl mb-2">Room ID</label>
          <input 
            value={roomId} 
            onChange={e => setRoomId(e.target.value)} 
            className="input-comic w-full text-xl"
            placeholder="Enter room name..."
          />
        </div>
        <div>
          <label className="block font-bold text-xl mb-2">Your Name</label>
          <input 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
            className="input-comic w-full text-xl"
            placeholder="Who are you?"
          />
        </div>
        
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={onJoin}
            disabled={joined}
            className={`btn-comic flex-1 ${joined ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'primary'}`}
          >
            {joined ? "Joined!" : "Join Room"}
          </button>
          <button 
            onClick={onLeave}
            className="btn-comic danger"
          >
            Leave
          </button>
        </div>
        
        <div className="text-lg font-bold mt-4 flex items-center justify-between bg-[var(--color-paper)] p-3 rounded-xl border-3 border-ink border-dashed">
          <span>Status:</span>
          <span className={`px-3 py-1 rounded-full border-3 border-ink transition-colors duration-300 ${joined ? 'bg-green-300 text-black' : 'bg-red-300 text-black'}`}>
            {joined ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
}