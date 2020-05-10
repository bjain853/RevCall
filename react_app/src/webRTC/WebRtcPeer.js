import React, { Component } from 'react';


_IdGenerator=()=>{
    return '_'+Math.random().toString(36).substr(2,9);
}


class WebRTCPeerConnection extends React.Component {

    state = {
        startDisabled: false,
        callDisabled: true,
        hangUpDisabled: true,
        servers: null,
        peerConnections: [],
        localStream: null
    }

    localVideoRef = React.createRef(); //create a reference to the elemnent that will display this
    remoteVideoRef = React.createRef()//create a reference to the elemnent that will display this

    start = () => { //get permisiion in local peer
        this.setState({
            startDisabled: true

        });
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        }).then(this._gotStream).catch(e => alert("getUserMedia() error" + e.name));
    };

    _gotStream = (stream) => {
        this.localVideoRef.current.srcObject = stream;
        this.setState({
            callDisabled: false,
            localStream: stream
        })
    };

    call = () => {
        // this.setState({
        //     callDisabled:true,
        //     hangUpDisabled:false
        // });

        let { localStream } = this.state;
        let servers = null;     //connect with server somehow :(
        let peerConnections = [];

        peerConnections.push(new RTCPeerConnection(servers));
        peerConnections.push(new RTCPeerConnection(servers))
        //console.log(peerConnections);

        peerConnections.forEach((connection) => {
            connection.onicecandidate = (event) => this._onIceCandidate(connection, event);
            connection.oniceconnectionstatechange = (event) => this._onIceStateChange(connection, event);
        })

        //    for(let i=0;i<peerConnections.length;i++){
        //        peer
        //        peerConnections[i].oniceconnectionstatechange =e=>this.onIceStateChange(peerConnections[i],e);
        //    }

        peerConnections[1].ontrack = this._gotRemoteStream;

        localStream.getTracks().forEach(track => peerConnections[0].addTrack(track, localStream));

        peerConnections[0].createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        })
            .then(this._oncreateOfferSuccess, error => {
                console.error('Failed to create session description', error.toString());
            })

        this.setState({
            callDisabled: true,
            hangUpDisabled: false,
            servers,
            peerConnections,
            localStream
        })


    }

    _gotRemoteStream=(event)=>{
        console.log(event.streams);
        this.remoteVideoRef.current.srcObject=event.streams[0];
    }

    _oncreateOfferSuccess = (desc) => {
        let { peerConnections } = this.state;

        peerConnections[0].setLocalDescription(desc).then(() => console.log("pc1 setLocalDescription complete createOffer"),
            error => console.error("pc1 Failed to set session description in createOffer", error.toString())
        );

        peerConnections[1].setRemoteDescription(desc).then(
            () => {
                console.log("pc2 setRemoteDescription complete createOffer");
                peerConnections[1].createAnswer().then(this._onCreateAnswerSuccess, error => console.error("pc2 Failed to set session description in createAnswer", error.toString())
                );
            },
            error => console.error("pc2 Failed to set session description in createOffer",
                error.toString())
        );
    };

    _onCreateAnswerSuccess = (desc) => {
        let { peerConnections } = this.state; //get peerConnections from state
       

        peerConnections[0] //set remote peer's description in local peer
        .setRemoteDescription(desc)
        .then(
            () =>
                console.log(
                    "pc1 setRemoteDescription complete createAnswer"
                ),
            error =>
                console.error(
                    "pc1 Failed to set session description in onCreateAnswer",
                    error.toString()
                )
        );

    peerConnections[1]  //set local peer's description in remote peer
        .setLocalDescription(desc)
        .then(
            () =>
                console.log(
                    "pc2 setLocalDescription complete createAnswer"
                ),
            error =>
                console.error(
                    "pc2 Failed to set session description in onCreateAnswer",
                    error.toString()
                )
        );

        // for(let i=0;i<peerConnections.length;i++){

        // peerConnections[i].setRemoteDescription(desc)
        // .then(

        // );
        // }

    }

    _onIceCandidate = (peerConnection, event) => {
        let { peerConnections } = this.state;
        
        let otherPeerConnection = (peerConnection === peerConnections[0]) ? peerConnections[1] : peerConnections[0];
        
        if(event.candidate!==null){
            otherPeerConnection.addIceCandidate(event.candidate)
            .then(
                () => console.log('addIceCandidate success'),
                error => console.error('failed to add ice candidate', error.toString())
            )
        }
        
    }

    _onIceStateChange(connection,event){
        console.log(connection,event)
    }

    hangup = () => {
        let { peerConnections } = this.state;

        peerConnections.forEach(connection => connection.close());

        this.setState({
            peerConnections: [],
            hangUpDisabled: true,
            callDisabled: false
        })
    }

    render() {
        const { startDisabled, callDisabled, hangUpDisabled } = this.state;
        return (
            <div className='container'>
                <div className='card blue darken-1'>
                    <video ref={this.localVideoRef} autoPlay />
                </div>
                <div className='card blue-grey darken-1'>
                    <video ref={this.remoteVideoRef} autoPlay />
                </div>
                <div>
                    <button className='waves-effect waves-light blue btn' onClick={this.start} disabled={startDisabled}>Start</button>
                    <button className='waves-effect waves-light green btn' onClick={this.call} disabled={callDisabled}>Call</button>
                    <button className='waves-effect waves-light red btn' onClick={this.hangup} disabled={hangUpDisabled}>Hang Up</button>

                </div>
            </div>
        )
    }

}

export default WebRTCPeerConnection

