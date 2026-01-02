import { Server } from "socket.io";

let io;
let rooms = {}; // { roomId: Set of socket IDs }
let members = {}; // { socketId: { id, name, roomId } }

export async function GET(req) {

  if (!io) {
    io = new Server(res.socket.server, {
      path: "/api/socket",
      cors: { origin: "*" },
    });

    console.log("Socket.IO server started");

    io.on("connection", (socket) => {
      console.log("client connected", socket.id);

      socket.on("join-room", ({ roomId, displayName }) => {
        // Initialize room if doesn't exist
        rooms[roomId] = rooms[roomId] || new Set();

        // Get existing members in the room with their names
        const existingMembers = Array.from(rooms[roomId]).map(id => ({
          id: id,
          name: members[id]?.name || 'Guest'
        }));
        
        // Send existing members to the new joiner
        socket.emit("existingPeers", existingMembers);

        // Add new member to tracking
        members[socket.id] = { id: socket.id, name: displayName || 'Guest', roomId };
        rooms[roomId].add(socket.id);
        socket.join(roomId);

        // Send complete members list (including self) to the joiner
        const allMembers = Array.from(rooms[roomId]).map(id => ({
          id: id,
          name: members[id]?.name || 'Guest'
        }));
        socket.emit("room-joined", { members: allMembers });

        // Notify others about the new member with their name
        socket.to(roomId).emit("new-peer", { 
          id: socket.id, 
          name: displayName || 'Guest' 
        });

        console.log(`${displayName} joined room ${roomId}`);
      });

      socket.on("signal", (payload) => {
        io.to(payload.to).emit("signal", payload);
      });

      socket.on("disconnect", () => {
        const memberInfo = members[socket.id];
        
        for (const roomId in rooms) {
          if (rooms[roomId].has(socket.id)) {
            rooms[roomId].delete(socket.id);
            socket.to(roomId).emit("peer-left", { id: socket.id });
            
            if (memberInfo) {
              console.log(`${memberInfo.name} left room ${roomId}`);
            }
          }
        }
        
        // Clean up member data
        delete members[socket.id];
      });

      socket.on("leave-room", ({ roomId }) => {
        const memberInfo = members[socket.id];
        
        if (rooms[roomId]) {
          rooms[roomId].delete(socket.id);
          socket.to(roomId).emit("peer-left", { id: socket.id });
          
          if (memberInfo) {
            console.log(`${memberInfo.name} left room ${roomId}`);
          }
        }
        
        socket.leave(roomId);
        delete members[socket.id];
      });
    });
  }

  return new Response("Socket server is running");
}
