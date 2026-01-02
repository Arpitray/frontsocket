import { useEffect } from "react";

/**
 * Hook to handle video playback sync events (play, pause, seek)
 * @param {Object} socketRef - Ref object containing the socket instance
 */
export function usePlaybackSync(socketRef) {
  useEffect(() => {
    const socket = socketRef?.current;
    if (!socket) return;

    socket.on("video-play", () => {
      document.querySelectorAll("video[id^='remote_']").forEach(v => v.play());
    });

    socket.on("video-pause", () => {
      document.querySelectorAll("video[id^='remote_']").forEach(v => v.pause());
    });

    socket.on("video-seek", ({ time }) => {
      document.querySelectorAll("video[id^='remote_']").forEach(v => {
        if (v.readyState >= 2) v.currentTime = time;
      });
    });

    return () => {
      socket.off("video-play");
      socket.off("video-pause");
      socket.off("video-seek");
    };
  }, [socketRef]);
}
