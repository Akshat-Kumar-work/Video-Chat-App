import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';

import peer from '../services/peer';

const Room = () => {

  const socket = useSocket();

  const [remoteSocketId , setRemoteSocketId] = useState(null);
  const [myStream , setMyStream] = useState(null);
  const [remoteStream , setRemoteStream] = useState(null);


  const handleUserJoined = useCallback( ({email,id})=>{
    console.log("email",email);
    setRemoteSocketId(id)
  },[]);

  const handleIncomingCall = useCallback( async({from,offer})=>{

    setRemoteSocketId(from);

       //getting current user media video and audio
       const stream  = await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
      });

      setMyStream(stream);

    console.log("incoming call ",from ,offer);
    const ans = await peer.getAnswer(offer);
    socket.emit('call:accepted',{to:from,ans})
  } ,[socket,remoteSocketId]);

  const sendStream = useCallback( ()=>{
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track,myStream)
    }
  },[myStream])

  const handleCallAccepted = useCallback(async({from,ans})=>{
    peer.setLocalDescription(ans);
    console.log("call accepted");
   sendStream()
  },[sendStream])

  const handleNegotiationNeeded = useCallback(async()=>{
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
  },[]) 

  const handleNegoNeedIncoming = useCallback( async ({from , offer})=>{
    const ans =  await peer.getAnswer(offer);
    socket.emit('peer:nego:done',{to:from,ans})
  },[socket])

  const handleNegoNeedFinal = useCallback(async ({from,ans})=>{
   await peer.setLocalDescription(ans)
  },[socket])
  

  useEffect( ()=>{
    peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    return ()=>{
      peer.peer.removeEventListener("negotiationneeded",handleNegotiationNeeded)
    }
  },[handleNegotiationNeeded])

  useEffect(()=>{
    peer.peer.addEventListener('track',async ev =>{
      const remoteStream = ev.streams
      //stream is an array, we get 0th element of stream because there are many streams
      setRemoteStream(remoteStream[0]);
    })
  },[remoteStream])
  
  useEffect( ()=>{
    socket.on('user:joined',handleUserJoined)

    socket.on('incoming:call',handleIncomingCall)

    socket.on('call:accepted',handleCallAccepted)

    socket.on('peer:nego:needed',handleNegoNeedIncoming)

    socket.on('peer:nego:final',handleNegoNeedFinal)

    return ()=>{
      socket.off('user:joined',handleUserJoined)
      socket.off('incoming:call',handleIncomingCall)
      socket.off('call:accepted',handleCallAccepted)
      socket.off('peer:nego:needed',handleNegoNeedIncoming)
      socket.off('peer:nego:final',handleNegoNeedFinal)

    }
  },[socket,handleUserJoined,handleIncomingCall ,handleCallAccepted,handleNegoNeedFinal,handleNegoNeedIncoming]);

  const handleCallUser = useCallback( async ()=>{

    //getting current user media video and audio
    const stream  = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    });

    //creating offer
    const offer = await peer.getOffer();
    //sending offer to remotesocketId using socket.io
    socket.emit("user:call",{to:remoteSocketId ,offer});
    setMyStream(stream);

  },[remoteSocketId,socket]);
  
  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in Room"}</h4>

      {
        myStream && <button onClick={sendStream}>Send Stream</button>
      }

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

      {
        remoteStream &&
        <>

        <h1>Remote Stream</h1>
        <ReactPlayer playing height="100px" width="200px" url={remoteStream}/>

        </>
      }
      
    </div>
  )
}

export default Room;