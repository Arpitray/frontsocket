export const STUN_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export const SIGNAL_SERVER_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://socket-0gcf.onrender.com";
