import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';
import ReactPlayer from 'react-player';

import peer from '../services/peer';

const Room = () => {

  const socket = useSocket();


  const [message , setMessage] = useState("");
  const [receivedMess, setReceivedMess] = useState("");



  const [remoteSocketId , setRemoteSocketId] = useState(null);
  const [myStream , setMyStream] = useState(null);
  const [remoteStream , setRemoteStream] = useState(null);


  // function to handle new remote  user joined in room
  const handleUserJoined = useCallback( ({email,id})=>{
    console.log("email",email);
    setRemoteSocketId(id)
  },[]);



  //handle call coming from peer
  const handleIncomingCall = useCallback( async({from,offer})=>{

    //set remote socket id of user from which call is coming
    setRemoteSocketId(from);

       //getting our current user media video and audio
       const stream  = await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
      });

      //setting current user steam
      setMyStream(stream);

    console.log("incoming call ",from ,offer);

    //creating answer for the offer given by called user
    const ans = await peer.getAnswer(offer);

    //emit the call:accepted event 
    socket.emit('call:accepted',{to:from,ans})
  } ,[socket]);



  //send our stream to another peeer
  //get tracks provide our own tracks which can be audio and video
  //add track used to add our tracks into  peer connection 
  const sendStream = useCallback( ()=>{
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track,myStream)
      console.log(track)
      
    }
  },[myStream])


  //function to handle call accepted event
  const handleCallAccepted = useCallback(async({from,ans})=>{
    peer.setLocalDescription(ans);
    console.log("call accepted");
   sendStream()
  },[sendStream])



  const handleNegotiationNeeded = useCallback(async()=>{
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
  },[socket,remoteSocketId]) 

  const handleNegoNeedIncoming = useCallback( async ({from , offer})=>{
    const ans =  await peer.getAnswer(offer);
    socket.emit('peer:nego:done',{to:from,ans})
  },[socket])

  const handleNegoNeedFinal = useCallback(async ({from,ans})=>{
   await peer.setLocalDescription(ans)
  },[])
  

  //use Effect for negotitation needed
  useEffect( ()=>{
    peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    return ()=>{
      peer.peer.removeEventListener("negotiationneeded",handleNegotiationNeeded)
    }
  },[handleNegotiationNeeded])

  //track is an event listener, which is used to listen for the remote user track after the remote user track is added by addTrack() method inside the peer connection
  useEffect(()=>{
    peer.peer.ontrack =  ( (ev) =>{
      console.log(ev)
      const remoteStream = ev.streams
      //stream is an array, we get 0th element of stream because there are many streams
      setRemoteStream(remoteStream[0]);
    })
  },[])


  //use effect for ice candidate
  useEffect( ()=>{
    
    peer.peer.onicecandidate = ((e)=>{
      const candidate = e.candidate
      socket.emit("sharingNewIceCandidate",{to:remoteSocketId,candidate});
    })
  },[socket])
  

  //use Effect for socket events
  useEffect( ()=>{
    socket.on('user:joined',handleUserJoined)

    socket.on('incoming:call',handleIncomingCall)

    socket.on('call:accepted',handleCallAccepted)

    socket.on('peer:nego:needed',handleNegoNeedIncoming)

    socket.on('peer:nego:final',handleNegoNeedFinal)

    socket.on('NewIceCandidateReceived',({from,candidate})=>{
      if(candidate){
        peer.peer.addIceCandidate(candidate);
      }
    })


    return ()=>{
      socket.off('user:joined',handleUserJoined)
      socket.off('incoming:call',handleIncomingCall)
      socket.off('call:accepted',handleCallAccepted)
      socket.off('peer:nego:needed',handleNegoNeedIncoming)
      socket.off('peer:nego:final',handleNegoNeedFinal)
      socket.off('NewIceCandidateReceived')
    }
  },[socket, handleUserJoined,handleIncomingCall ,handleCallAccepted,handleNegoNeedFinal,handleNegoNeedIncoming]);



  //function to call peer
  const handleCallUser = useCallback( async ()=>{

    //getting current user media video and audio
    const stream  = await navigator.mediaDevices.getUserMedia({
      audio:true,
      video:true
    });

    console.log(stream)

    //creating offer
    const offer = await peer.getOffer();
    //emit 'user:call' event to send offer to remotesocketId using socket.io
    socket.emit("user:call",{to:remoteSocketId ,offer});
    setMyStream(stream);

  },[remoteSocketId,socket]);


  const handleSubmit = useCallback( (e)=>{
    e.preventDefault();
    //emiting or triggering the message event with message data
    console.log("mess before emitting",message)
    socket.emit("message",message);
    setMessage("");
  },[message]);


  useEffect( ()=>{
  
    socket.on("receive-message",(message) => {
      setReceivedMess(message);
    });

  },[socket])


  
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

      {
        remoteSocketId && 

        <form onSubmit={handleSubmit}>
        <label htmlFor='message'>"Write Your message"</label>
        <input value={message} onChange={e=>setMessage(e.target.value)} id="message"  />
        <button type="submit">Send</button>      
      </form>

      }

      {
        receivedMess && 
        <div>
          {receivedMess}
          </div>
      }

    
      
    </div>
  )
}

export default Room;