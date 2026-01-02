import { io } from "socket.io-client";
import { SIGNAL_SERVER_URL } from "./config";

let socket = null;

export function initSocket(token) {
  if (!socket) {
    socket = io(SIGNAL_SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      auth: { token }
    });
  }

  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
