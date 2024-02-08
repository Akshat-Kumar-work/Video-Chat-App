import React, { useCallback, useEffect, useState } from 'react'
import {useSocket} from "../context/SocketProvider";
import { useNavigate } from 'react-router-dom';


const Lobby = () => {

  const [email,setEmail] = useState("");
const [room , setRoom] = useState("");

const socket = useSocket();

const navigate = useNavigate();

const handleSubmitForm = useCallback( (e)=>{
  e.preventDefault();
  socket.emit('room:join',{email , room});

},[email,room,socket]);

const handleJoinRoom = useCallback( (data)=>{
  const {email,room} = data;
  navigate(`/room/${room}`)
},[]);

useEffect( ()=>{
  socket.on('room:join',handleJoinRoom);
  return ()=>{
    socket.off('room:join',handleJoinRoom);
  }
},[socket]);

  return (
    <div>
        <h1>Lobby</h1>
        <form onSubmit={handleSubmitForm}>

            <label htmlFor='email'>Email Id</label>
            <input type='email' id='email'  value={email} 
                onChange={e=>setEmail(e.target.value)}
            />

            <label htmlFor='room'>Room No.</label>
            <input type='text' id='room' value={room} 
                onChange={e=>setRoom(e.target.value)} />

            <button>Join</button>

        </form>
    </div>
  )
}

export default Lobby