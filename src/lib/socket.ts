import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("qrAuthToken");
};

export const getSocket = (): Socket | null => {
  if (typeof window === "undefined") return null;

  if (socket && socket.connected) {
    return socket;
  }

  const token = getAuthToken();
  if (!token) return null;

  if (!socket) {
    socket = io("/", {
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });
  } else if (!socket.connected) {
    socket.auth = { token } as any;
    socket.connect();
  }

  return socket;
};
