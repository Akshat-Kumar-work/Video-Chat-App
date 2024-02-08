import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';

const Room = () => {

  const socket = useSocket();

  const [remoteSocketId , setRemoteSocketId] = useState(null);
  const [myStream , setMyStream] = useState(null);

  const handleUserJoined = useCallback( ({email,id})=>{
    console.log("email",email);
    setRemoteSocketId(id)
  },[]);
  
  useEffect( ()=>{
    socket.on('user:joined',handleUserJoined)

    return ()=>{
      socket.off('user:joined',handleUserJoined)
    }
  },[socket,handleUserJoined]);

  const handleCallUser = useCallback( async ()=>{

    //getting current user media video and audio
    const stream  = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    });

    setMyStream(stream);
  },[]);
  
  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in Room"}</h4>

      {
        remoteSocketId &&  <button onClick={handleCallUser} >Call</button>
      }

      {
        myStream &&
        <>

        <h1>My Stream</h1>
        <ReactPlayer playing height="100px" width="200px" url={myStream}/>

        </>
      }
      
    </div>
  )
}

export default Room;