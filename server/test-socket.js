const { io } = require("socket.io-client");

const socket = io("http://localhost:4000");

socket.on("connect", () => {
    console.log("✅ Connected to Socket.io, id:", socket.id);
});

socket.on("task:created", (data) => {
    console.log("📥 task:created →", JSON.stringify(data, null, 2));
});

socket.on("task:updated", (data) => {
    console.log("📥 task:updated →", JSON.stringify(data, null, 2));
});

socket.on("task:deleted", (data) => {
    console.log("📥 task:deleted →", JSON.stringify(data, null, 2));
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected");
});
