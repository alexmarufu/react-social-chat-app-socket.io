const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
  },
})

let users = []
console.log(users)

io.on('connection', (socket) => {
  console.log(`user connected`);
  socket.on("users", (userId) => {
    const user = users.some(user => user.userId === userId)
    !user && users.push({ userId, socketId: socket.id })
    console.log(`user: ${socket.id}`)
    console.log(users)
  })
   
  socket.on('sendMessage', (message) => {
   const friend = users.find(user => user.userId === message.toUserId)
   const friendAvailable = users.some(user => user.userId === message.toUserId)
   friendAvailable && io.to(friend.socketId).emit('ReceiveMessage', message) 
   //io.emit("ReceiveMessage", message)
   //socket.broadcast.emit('ReceiveMessage', message)
   console.log(message)
  });

  socket.on("callFriend", ({ to, signal, from }) => {
    console.log(signal)
    const friend = users.find(user => user.userId === to)  
		io.to(friend.socketId).emit("callFriendRequest", signal);
	});

  socket.on('disconnect', () => {
    //socket.broadcast.emit('ReceiveMessage', message)
    console.log('user-offline');
    const user = users.find(user => user.socketId === socket.id)
    //users = users.filter(user => user.socketId !== socket.id)
    const userIndex  = users.indexOf(user)
    users.splice(userIndex, 1)
    io.emit("users", users)
  })

  
});

server.listen(4001, () => {
  console.log('listening on *:4001');
});
   