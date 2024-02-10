

class PeerService{


    constructor(){
        if(!this.peer){
            //rtcpeerconnection provide the method to connect local computer to remote peer
            this.peer = new RTCPeerConnection({
                iceServers:[{
                    urls:[
                        "stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478",
                    ]
                }]
            })
        }
    }

    async getAnswer (offer){
        if(this.peer){
            //setting remote description sdp
            await this.peer.setRemoteDescription(offer)
            const ans = await this.peer.createAnswer()
            //setting local description => sdp
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }


    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            //setting local description => sdp
            await this.peer.setLocalDescription(new RTCSessionDescription(offer))
            return offer;
        }
    }

    async setLocalDescription(ans){
        if(this.peer){
            //setting remote description =>sdp
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }


}

export default new PeerService();