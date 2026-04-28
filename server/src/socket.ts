import { Server } from "socket.io";
import http from "http";

let io: Server;

export function initSocket(httpServer: http.Server) {
    io = new Server(httpServer, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
        socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
    });
    return io;
}

export function getIO(): Server {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}
