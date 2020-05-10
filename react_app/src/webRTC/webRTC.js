import React, { Component } from 'react';


class WebRTC extends Component {
    //maybe need an array for video streams later
    state = {
        numUsers: 1, //At least local user is there
        startDisabled: false,
        hangUpDisabled: true,
        callDisabled: true,
        servers: null,
        localStream: null,
        remoteVideoRefs: [],
        peerConnections: [],
        constraints: { audio: true, video: true, height: null, width: null },

    }

    _localVideoRef = React.createRef();


    _IdGenerator = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    start = () => {
        //prepare local stream & add local peer connection to peer connections
        let peerConnections = [];
        peerConnections.push({
            id: this._IdGenerator(),
            connection: new RTCPeerConnection()
        })
        this.setState({
            startDisabled: true,
            peerConnections

        });
        const constaraints = {
            audio: false,
            video: true
        }
        navigator.mediaDevices.getUserMedia(constaraints).then(this._gotStream).catch(e => alert("getUserMedia() error" + e.name + e.toString()));
    };

    _gotStream = (stream) => {
        //console.log(this._localVideoRef);
        this._localVideoRef.current.srcObject = stream; //set localVideoref's source to the acquired stream
        let peerConnections = [];
        peerConnections.push({ id: this._IdGenerator(), connection: new RTCPeerConnection() });
        //        peerConnections.push({ id: this._IdGenerator(), connection: new RTCPeerConnection() })

        this.setState({
            callDisabled: false,
            localStream: stream,
            peerConnections
        })

    };


    call = () => {
        //offer connection to each peer
        var { localStream, peerConnections, remoteVideoRefs } = this.state;
        var servers = null;
        //var peerConnections = [];
        /*You call with atleast one peer selected */
        peerConnections.push({
            id: this._IdGenerator(),
            connection: new RTCPeerConnection()
        })

        remoteVideoRefs.push(React.createRef());
        /*****Inserting dummy peer */

        peerConnections.forEach((connection) => {

            connection.onicecandidate = (event) => {
                if (!event.candidate) return;
                this._onIceCandidate(connection, event);
            }
            connection.oniceconnectionstatechange = (event) => this._onIceStateChange(connection, event);
        })

        var remotePeers=peerConnections.slice(1,peerConnections.length-1);

        /**
         * 
         * Cannot match correct streams to correct refs and hence cannot get the video
         * 
         */
        remotePeers.map(peers=>{//call gotRemoteStream for every stream except the local that is at i=0
            peers.connection.ontrack=this._gotRemoteStream;
        })

        // for (var j = 1; j < this.numUsers + 1; j++) {  
        //     console.log('calling remote stream for peer# '+j);
        //     peerConnections[j].ontrack = this._gotRemoteStream; //connect each connection to a video stream
        // }

        //console.log(peerConnections);

        //const {...localPeerObject,id}=peerConnections.length!==0?peerConnections[0]:console.error('array not found');


        
        localStream.getTracks().forEach(track => peerConnections[0].connection.addTrack(track, localStream));  //add local stream's tracks to local peer connection's stream

        peerConnections[0].connection.createOffer({
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
            localStream,
            remoteVideoRefs
        })


    }

    _gotRemoteStream = (event) => { //modify this to distibute streams to video frames
        //console.log(event.streams);
        console.log(this.remoteVideoRefs);
        this.remoteVideoRefs.forEach((reference) => {
            reference.current.srcObject = event.streams[0];
        })

    }

    _oncreateOfferSuccess = (desc) => { //set descriptions or sdp
        let { peerConnections } = this.state;

        peerConnections[0].connection.setLocalDescription(desc).then(() => console.log('Local peer\'s description set after creation of offer'),
            error => console.error("pc1 Failed to set session description in createOffer", error.toString())

        );

        for (let i = 1; i < peerConnections.length; i++) {  //set remote descriptions for all other peer connections
            peerConnections[i].connection.setRemoteDescription(desc).then(
                () => {
                    console.log("pc" + i + " setRemoteDescription complete createOffer");
                    peerConnections[i].connection.createAnswer().then(this._onCreateAnswerSuccess, error => console.error("pc" + i + " Failed to set session description in createAnswer", error.toString())
                    );
                },
                error => console.error("pc" + i + "Failed to set session description in createOffer",
                    error.toString())
            );
        }

    }

    _onCreateAnswerSuccess = (desc) => {
        let { peerConnections } = this.state; //get peerConnections from state

        peerConnections[0] //set remote peer's description in local peer
            .connection.setRemoteDescription(desc)
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
        for (let i = 1; i < peerConnections.length; i++) {
            peerConnections[i]  //set local peer's description in remote peer
                .connection.setLocalDescription(desc)
                .then(
                    () =>
                        console.log(
                            "pc" + i + " setLocalDescription complete createAnswer"
                        ),
                    error =>
                        console.error(
                            "pc" + i + " Failed to set session description in onCreateAnswer",
                            error.toString()
                        )
                );
        }

    }

    _onIceCandidate = (peerConnection, event) => {
        let { peerConnections } = this.state;

        let otherPeerConnections = peerConnections.filter(pc => {
            return pc.connection !== peerConnection
        })


        otherPeerConnections.forEach(
            (peer) => {
                if (event.candidate !== null) {
                    peer.addIceCandidate(event.candidate).then(
                        () => console.log('addIceCandidate success'),
                        error => console.error('failed to add ice candidate', error.toString())
                    )

                }
            }
        )





    }

    _onIceStateChange(connection, event) {
        console.log(connection, event)
    }

    hangup = () => {
        // close all peers
        // later close specifed peers only
        let { peerConnections } = this.state;

        peerConnections.forEach(peerconnection => peerconnection.connection.close());

        this.setState({
            peerConnections: [],
            hangUpDisabled: true,
            callDisabled: false
        })
    }


    addUser = () => {
        // create new peer connection and connect them in the room i.e. give them an offer from previous peers
        var { numUsers, peerConnections, remoteVideoRefs, servers } = this.state;

        var newPeerConnection = {
            id: this._IdGenerator(),
            connection: new RTCPeerConnection(servers)
        };

        this.setState({
            numUsers,
            peerConnections,
            remoteVideoRefs
        })

        peerConnections[0].connection.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(
            this._oncreateOfferSuccessforNewClient,
            error => console.error('Offer not created for new peer connection', error.toString()))

        peerConnections.push(newPeerConnection);
        remoteVideoRefs.push(React.createRef());
        numUsers++;


        /*

        */

        // displays another menu and we can select from the listed members to add to the current call
    }

    _oncreateOfferSuccessforNewClient = (desc) => {
        let { peerConnections } = this.state;
        peerConnections[0].connection.setLocalDescription(desc).then(() => console.log('Local peer\'s description set after creation of offer'),
            error => console.error("pc1 Failed to set session description in createOffer", error.toString()
            )
        );

        let lastIndex = peerConnections.length - 1;

        peerConnections[lastIndex].connection.setRemoteDescription(desc).then(
            () => {
                console.log("pc" + lastIndex + " setRemoteDescription complete createOffer");
                peerConnections[lastIndex].connection.createAnswer().then(this._onCreateAnswerSuccessForNewClient, error => console.error("pc" + lastIndex + " Failed to set session description in createAnswer", error.toString())
                );
            },
            error => console.error("pc" + lastIndex + "Failed to set session description in createOffer",
                error.toString())
        );



    }

    _onCreateAnswerSuccessForNewClient = (desc) => {
        let { peerConnections } = this.state;
        let lastIndex = peerConnections.length - 1;

        peerConnections[0].connection.setRemoteDescription(desc).then(
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

        peerConnections[lastIndex].connection.setLocalDescription(desc).then(
            () =>
                console.log(
                    "pc" + lastIndex + " setLocalDescription complete createAnswer"
                ),
            error =>
                console.error(
                    "pc" + lastIndex + " Failed to set session description in onCreateAnswer",
                    error.toString()
                )
        );

    }




    render() {
        const { startDisabled, callDisabled, hangUpDisabled, remoteVideoRefs } = this.state;
        const noPeerVideo=(
            <div>
            <h1 className='red-text'>No peer's available</h1>
            </div>
        )
            //console.log(remoteVideoRefs);
        const peerVideo=remoteVideoRefs.map((reference) => {
            return (
                <div className='card blue-grey darken-1' key={this._IdGenerator()}>
                    <video ref={reference} autoPlay />
                </div>
            )
        })
        return (
            <div className='container'>
                <div className='card blue darken-1'>
                    <video ref={this._localVideoRef} autoPlay />
                </div>
                {  remoteVideoRefs.length===0?noPeerVideo:peerVideo     }
                <div>
                    <button className='waves-effect waves-light blue btn' onClick={this.start} disabled={startDisabled}>Start</button>
                    <button className='waves-effect waves-light green btn' onClick={this.call} disabled={callDisabled}>Call</button>
                    <button className='waves-effect waves-light red btn' onClick={this.hangup} disabled={hangUpDisabled}>Hang Up</button>
                    <button className='float-btn waves-effect waves-light red btn' onClick={this.addUser}>+</button>


                </div>
            </div>
        )
    }



}


export default WebRTC