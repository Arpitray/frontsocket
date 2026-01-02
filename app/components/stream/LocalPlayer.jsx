'use client';
import React, { forwardRef } from 'react';

/**
 * Helper to format time in MM:SS format
 */
function formatTime(time) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

import { Panel } from "../ui/Panel";

/**
 * LocalPlayer Component
 * Displays the local video playback with controls for the host
 */
export const LocalPlayer = forwardRef(function LocalPlayer({
  isStreaming,
  isPlaying,
  currentTime,
  duration,
  volume,
  micEnabled,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMic,
  onToggleFullscreen
}, ref) {
  return (
    <Panel 
      title="Local Playback" 
      className="group hover-lift"
      variant="default"
      noPadding
    >
      <div className="p-4">
        {/* Header Status */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-ink"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 border border-ink"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 border border-ink"></div>
          </div>
          {isStreaming ? (
            <span className="live-indicator text-xs font-bold animate-pulse text-red-500 border-2 border-red-500 px-2 py-0.5 rounded-full">LIVE</span>
          ) : (
            <span className="text-xs font-bold bg-yellow-200 px-2 py-1 border border-ink rounded font-comic">Ready to stream</span>
          )}
        </div>

        {/* Video Container - Full Width Dashed Style */}
        <div className="relative w-full aspect-video bg-[var(--color-paper)] border-3 border-dashed border-ink rounded-xl overflow-hidden p-1 shadow-inner">
          <video 
            ref={ref} 
            className="w-full h-full object-cover relative z-10 rounded-lg"
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onPlay={onPlay}
            onPause={onPause}
            onClick={onTogglePlay}
          />

          {/* Stand By Placeholder */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/40 z-0 pointer-events-none">
            <div className="w-32 h-32 border-3 border-dashed border-ink/20 rounded-full flex items-center justify-center mb-4 animate-spin-slow">
              <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p className="text-3xl font-display font-bold opacity-60 transform -rotate-2">STAND BY</p>
            <p className="text-sm opacity-50 mt-2 font-comic">Select a video to start streaming</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="mt-4 flex flex-col gap-3 bg-[var(--color-paper)] border-3 border-ink rounded-xl p-4 shadow-[4px_4px_0px_0px_var(--color-ink)]">
          {/* Progress Bar */}
          <div className="relative h-4 bg-white border-2 border-ink rounded-full overflow-hidden shadow-inner">
             <div 
               className="absolute top-0 left-0 h-full bg-[var(--color-pastel-yellow)] border-r-2 border-ink transition-all duration-100"
               style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
             ></div>
             <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              value={currentTime} 
              onChange={onSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onTogglePlay} className="hover:scale-110 transition-transform p-1 hover-lift">
                {isPlaying ? (
                  <svg className="w-8 h-8 fill-ink" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-8 h-8 fill-ink" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              
              <div className="font-bold text-lg whitespace-nowrap font-comic">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Volume */}
              <div className="flex items-center gap-2 hover-lift p-1 rounded bg-white border-2 border-ink px-2 shadow-sm">
                <svg className="w-5 h-5 fill-ink flex-shrink-0" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume} 
                  onChange={onVolumeChange}
                  className="w-20 accent-ink cursor-pointer"
                />
              </div>

              {/* Mic Toggle */}
              <button onClick={onToggleMic} className="hover:scale-110 transition-transform p-2 hover-lift border-2 border-ink rounded-full bg-white shadow-sm" title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                {micEnabled ? (
                  <svg className="w-5 h-5 fill-ink" viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-4 4.9V20h-2v-4.1A5 5 0 0 1 7 11H5a7 7 0 0 0 6 6.92V22h2v-4.08A7 7 0 0 0 19 11h-2z"/></svg>
                ) : (
                  <svg className="w-5 h-5 fill-red-500" viewBox="0 0 24 24"><path d="M19 11a7 7 0 0 1-7 7v3h-2v-3a7 7 0 0 1-4-6.33V11H5v-.33A9 9 0 0 0 12 21v-3a5 5 0 0 0 5-5h2zM4.27 3L3 4.27l4 4V11h2v2a5 5 0 0 0 4.73 4.98L19.73 21 21 19.73 4.27 3z"/></svg>
                )}
              </button>

              {/* Fullscreen */}
              <button onClick={onToggleFullscreen} className="hover:scale-110 transition-transform p-2 hover-lift border-2 border-ink rounded-full bg-white shadow-sm">
                <svg className="w-5 h-5 fill-ink" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
});