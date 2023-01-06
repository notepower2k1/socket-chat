const io = require('socket.io')("https://social-network-reactjs-hx9c.vercel.app",{
    cors:{
        origin:"*",
    }
});

let users = [];

const addUser = (userID,socketID) => {
    !users.some((user) => user.userID === userID) &&
        users.push({userID,socketID});
}

const removeUser =(socketID)=>{
    users = users.filter((user) => user.socketID !== socketID);
}

const getUser = (userID) =>{
    return users.find((user)=>user.userID === userID);
}

io.on("connection", (socket)=>{
    //when connect
    console.log("a user connected.");
    //take userID and socketID from user
    socket.on("addUser",userId=>{
        addUser(userId,socket.id);
        io.emit("getUsers",users);
    })

    socket.on("joinConvRoom", data => {
        socket.join(data);
    });

    //send and get message

    socket.on("sendMessage",({senderID, text, room})=>{
        if (room) {
            socket.to(room).emit("getMessage",{
                senderID,
                text,
            });
        };
    });

    socket.on("sendMessNotification",({otherUserList})=>{
   

        otherUserList.forEach((userID) => {
            const user = getUser(userID);
            if (user) {
                io.to(user.socketID).emit("getMessNotification",otherUserList)
             }
          
        })
       
      
    });
    //send and get notification
    socket.on("sendNotification",(noty) => {
        const user = getUser(noty.recipient.id);
        if (user) {
            io.to(user.socketID).emit("getNotification",noty)
        }
    })

    //when disconnect
    socket.on("disconnect",()=>{
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers",users);

    })


    socket.on('connect_error', function (data) {
        console.log('connection_error');
    });
})
