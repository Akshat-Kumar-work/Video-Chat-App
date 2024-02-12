# WEB RTC
WebRTC stands for Web Real-Time Communication. It's a technology that allows browsers to establish direct communication between them without needing any additional plugins or software installations. In simple terms, it enables real-time audio, video, and data transfer between web browsers.

# SOCKET
-Install socket.io library to use socket protocols by 
npm i socket.io in server
npm i Socket.io-client in client 
-Integrate socket in server side
-Integrate socket in client side

# 4 Steps To Create a Simple WEB RTC Application
1: Create instance of new  RTCpeerConnection object by passing ice Configurations which is turn and stun servers, you can use freeice library also which provide free ice servers


2: To connect with remote user 
-Create offer by using .createOffer() method alwasy make that function async and use await inside which you are creating offer
After creating offer save the offer inside localDescription and share it to the remote user through the sockets   

-In remote user ,Create answer after setting the offer as setRemoteDescription(offer) , by peer.createAnswer(), and set the answer as localDescription of that remote user and share it to the user which had sent the offer

-after getting the answer of sent offer from remote user through sockets, save answer as remote Description, and share the stream to remote user


3: Sharing Media Stream
-First we have to get our Media Stream from navigator like this
const stream  = await navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
      });
      setMyStream(stream)

-After getting our own stream , we will share it with remote user, getTrack() method will provide the tracks from the stream which can be anything audio video:-
 const sendStream = useCallback( ()=>{
    for(const track of myStream.getTracks()){
      peer.peer.addTrack(track,myStream)
      console.log(track) }
   },[myStream])
addTrack will pass or add the tracks to the peer-connections, the ontrack event will occur and our peerConnection will listen that onTrack event and set the stream into remote stream,please read onTrack Event listener bellow for more clarifications


4: Add 3 major Event listener inside useEffect having socket as dependencies 

-onTrack
we have to add event listener ontrack,to (receive or get or catch) the audio,video,screen share coming from remote client
To use that track we have to set the remoteStream state (custom use-state) by this, const remoteStream = event.streams
setRemoteStream(remoteStream[0])
Here we had use 0 to access the 0th element to access audio and video , because there can  be many streams 


-onicecandidate
we have to share the candidate which can get from event.candidate, by sockets to remote client
remote client which is receiving the new ice candidate through sockets event, will add that received ice-candidate through peer.addIceCandidate(Receviedcandidate)


-onnegotiationneeded
We have to add on nego needed event listener in which we have to create the offer for remote user again if created earlier by call button, and send it to the remote user through the sockets by emitting events and save the localDescrition(offer)
On other remote client, we will listen the nego needed and take that offer and set it as setRemoteDescription(offer), after this we will create ans and set it as setLocalDescription(ans) , and share that ans to the previous user which shared the offer, 
In that previous user,we will set the remotedescription(ans),ans which got from other user from sockets 


