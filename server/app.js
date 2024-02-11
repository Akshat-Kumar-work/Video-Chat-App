const { useCallback } = require("react");
const {Server} = require("socket.io");
const io = new Server (8000,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true
    }
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();



io.on('connection',socket=>{
    console.log("socket connected ",socket.id);
    //on room:join event 
    socket.on('room:join',data=> {

        //fetch data of user who joined the room
        const {email,room} = data
        
        emailToSocketIdMap.set(email,socket.id);
        socketIdToEmailMap.set(socket.id,email);

        //jo bhi previous joined user hoga ussi k pass y event emit hogaaa eslie jab hum join krenge toh hmari id remoteUserId m save nai hogi because we are the first one to join the room
        //emit user:joined event only  in  provided room, in which email and id is passed of joined user
        io.to(room).emit('user:joined',{email,id:socket.id});


        // current user ko join krwadia room
        socket.join(room);

        //after joining the room by current user , send room:join event emittion to current socket/user
        io.to(socket.id).emit('room:joined',data);


        //for messaging
        socket.on("message", (message)=>{
            
            socket.to(room).emit("receive-message",message)
        });
        
        //on user:call event
        socket.on("user:call",({to,offer})=>{
            //emit 'incoming:call' event to the user which our current user want to call
            io.to(to).emit('incoming:call',{from:socket.id,offer})
        })

        //on 'call:accepted' event
        socket.on('call:accepted',({to,ans})=>{
            //emit the 'call:accepted event for the user which send offer earlier and share offer answer to it
            io.to(to).emit('call:accepted',{from:socket.id,ans});
        })

        socket.on('peer:nego:needed',({to,offer})=>{
            io.to(to).emit('peer:nego:needed',{from:socket.id,offer});

        })

        socket.on('peer:nego:done',({to,ans})=>{ 
            io.to(to).emit('peer:nego:final',{from:socket.id,ans});
        })
    });
});