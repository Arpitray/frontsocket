import { useEffect, useState, useCallback, useRef } from "react";
import { initSocket, closeSocket } from "../lib/socket";

/**
 * Custom hook to manage room state and socket connection
 * @param {Object} options
 * @param {Function} options.onNewPeer - Callback when a new peer joins
 * @param {Function} options.onPeerLeft - Callback when a peer leaves
 * @param {Function} options.onSignal - Callback for signaling events
 * @returns {Object} Room state and methods
 */
export function useRoom({ onNewPeer, onPeerLeft, onSignal } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [members, setMembers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("existingPeers", setMembers);

    socket.on("room-joined", ({ members }) => {
      setMembers(members);
    });

    socket.on("peer-left", ({ id }) => {
      setMembers(prev => prev.filter(m => m.id !== id));
      onPeerLeft?.(id);
    });

    socket.on("new-peer", ({ id, name }) => {
      setMembers(prev =>
        prev.some(m => m.id === id)
          ? prev
          : [...prev, { id, name: name || "Guest" }]
      );
      onNewPeer?.({ id, name });
    });

    socket.on("signal", (data) => {
      onSignal?.(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("existingPeers");
      socket.off("room-joined");
      socket.off("peer-left");
      socket.off("new-peer");
      socket.off("signal");
      closeSocket();
    };
  }, [onNewPeer, onPeerLeft, onSignal]);

  // Join a room
  const joinRoom = useCallback((roomId, displayName) => {
    if (joined || !socketRef.current) return;
    
    setJoined(true);
    setRoomId(roomId);
    socketRef.current.emit("join-room", { roomId, displayName });
  }, [joined]);

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (!joined || !socketRef.current) return;

    socketRef.current.emit("leave-room", { roomId });
    setJoined(false);
    setMembers([]);
    setRoomId('');
  }, [joined, roomId]);

  // Send a signal to a specific peer
  const sendSignal = useCallback((to, type, data) => {
    if (!socketRef.current) return;

    socketRef.current.emit("signal", {
      to,
      from: socketRef.current.id,
      type,
      data
    });
  }, []);

  // Emit a custom event
  const emit = useCallback((event, data) => {
    if (!socketRef.current) return;
    socketRef.current.emit(event, data);
  }, []);

  return {
    socketRef,
    connected,
    members,
    joined,
    roomId,
    joinRoom,
    leaveRoom,
    sendSignal,
    emit,
    socketId: socketRef.current?.id
  };
}
