import React, { Component } from 'react';
import VideoScreen from './videoScreen';


class WebRTC extends Component {
    //maybe need an array for video streams later
    state = {
        numUsers: 1, //At least local user is there
        startDisabled: false,
        hangUpDisabled: true,
        callDisabled: true,
        servers: null,
        localStream: null,
        remoteVideoStreams: [],    //id,refObject,MediaStream
        peerConnections: [],    //id,connectionObj
        constraints: { audio: true, video: true, height: null, width: null },

    }

    _localVideoRef = React.createRef();


    _IdGenerator = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    }


    start = () => {
        //prepare local stream & add local peer connection to peer connections

        const constaraints = {
            audio: true,
            video: true
        };

        navigator.mediaDevices.getUserMedia(constaraints).then(this._gotStream).catch(e => alert("getUserMedia() error" + e.name + e.toString()));
    };

    _gotStream = (stream) => {

        /**
         * When you get the stream add it to videoRefs source and add a local peer connection in connections list
         */
        this._localVideoRef.current.srcObject = stream; //set localVideoref's source to the acquired stream

        let peerConnections = [];

        peerConnections.push({
            id: this._IdGenerator(),
            connection: new RTCPeerConnection()
        });

        // add localStream's track to local peerConnection
        stream.getTracks().forEach(track => peerConnections[0].connection.addTrack(track, stream));

        //console.log(peerConnections[0].connection);
        this.setState({
            callDisabled: false,
            localStream: stream,
            peerConnections,
            startDisabled: true,
        })

    };


    call = () => {
        //offer connection to each peer
        var { localStream, peerConnections, remoteVideoStreams } = this.state;
        var servers = null;


        peerConnections.forEach((connection) => {

            connection.connection.onicecandidate = (event) => {
                if (!event.candidate) return;
                this._onIceCandidate(connection.connection, event);
            }
            connection.connection.oniceconnectionstatechange = (event) => this._onIceStateChange(connection.connection, event);
        })


        /**
         * 
         * Cannot match correct streams to correct refs and hence cannot get the video
         * 
         */
        peerConnections.forEach(remotePeer => {
            remotePeer.connection.ontrack = this.gotRemoteStream;
        })

        /*You call with atleast one peer selected
                 
              Inserting Dummy Peer
             
              */
        let Id = this._IdGenerator();

        peerConnections.push({
            id: Id,
            connection: new RTCPeerConnection(servers)
        })


        var newMediaStream = new MediaStream();
        localStream.getTracks().forEach(track => peerConnections[1].connection.addTrack(track, newMediaStream));

        remoteVideoStreams.push({ id: Id, mediaStream: newMediaStream });



        /*********************************/

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
            remoteVideoStreams
        })


    }



    gotRemoteStream = (event) => { //modify this to distibute streams to video frames

        //console.log(event);
        const peerId = event.id;
        var { remoteVideoStreams } = this.state;

        for (let i = 0; i < remoteVideoStreams.length; i++) {
            if (remoteVideoStreams[i].id === peerId) {
                //remoteVideoStreams[i].mediaStream.addTrack(event.track, remoteVideoStreams[i].mediaStream);
                remoteVideoStreams[i].mediaStream=event.streams[0];
            }
        }

        this.setState({
            remoteVideoStreams
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
                    peer.connection.addIceCandidate(event.candidate).then(
                        () => console.log('addIceCandidate success'),
                        error => console.error('failed to add ice candidate', error.toString())
                    )

                }
            }
        )





    }

    _onIceStateChange(connection, event) {
        //console.log(connection, event)
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
        var { numUsers, peerConnections, remoteVideoStreams, servers, localStream } = this.state;



        const Id = this._IdGenerator()
        const lastIndex = peerConnections.length - 1;
        var newPeerConnection={ id: Id, connection: new RTCPeerConnection(servers) };

        const newMediaStream = new MediaStream();

        localStream.getTracks().forEach(track => newPeerConnection.connection.addTrack(track, newMediaStream));

        newPeerConnection.connection.ontrack = this.gotRemoteStream;
        newPeerConnection.connection.onicecandidate = (event) => {
            if (!event.candidate) return;
            this._onIceCandidate(peerConnections[lastIndex].connection, event);
        }
        newPeerConnection.connection.oniceconnectionstatechange = (event) => this._onIceStateChange(peerConnections[lastIndex].connection, event);


        peerConnections.push(newPeerConnection);
        remoteVideoStreams.push({ id: Id, mediaStream: newMediaStream });
        numUsers++;

        this.setState({
            numUsers,
            peerConnections,
            remoteVideoStreams
        })

        peerConnections[0].connection.createOffer({
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        }).then(
            this._oncreateOfferSuccessforNewClient,
            error => console.error('Offer not created for new peer connection', error.toString()))


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
                peerConnections[lastIndex].connection.createAnswer().then(this._onCreateAnswerSuccessForNewClient,
                    error => console.error("pc" + lastIndex + " Failed to set session description in createAnswer", error.toString())
                );
            },
            error => console.error("pc" + lastIndex + " Failed to set session description in createOffer",
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
        const { startDisabled, callDisabled, hangUpDisabled, remoteVideoStreams,localStream } = this.state;
        const noPeerVideo = (
            <div>
                <h1 className='red-text'>No peer's available</h1>
            </div>
        )
        //console.log(remoteVideoStreams);
        // const peerVideo = remoteVideoStreams.map((reference) => {
        //     reference.ref.current.srcObject=reference.mediaStream;
        //     console.log(reference.mediaStream);
        //     return (
        //         <div className='card blue-grey darken-1' key={reference.id}>
        //             <video ref={reference.ref} autoPlay />
        //         </div>
        //     )
        // })

        return (
            <div className='container'>
                <div className='card blue darken-1'>
                    <video ref={this._localVideoRef} autoPlay />
                </div>{(remoteVideoStreams.length !== 0) ?

                    (remoteVideoStreams.map(reference => {
                        return <VideoScreen reference={reference} localStream={localStream} key={reference.id} />
                    })
                    ) : noPeerVideo

                }

                <div>
                    <button className='waves-effect waves-light blue btn' onClick={this.start} disabled={startDisabled}>Start</button>
                    <button className='waves-effect waves-light green btn' onClick={this.call} disabled={callDisabled}>Call</button>
                    <button className='waves-effect waves-light red btn' onClick={this.hangup} disabled={hangUpDisabled}>Hang Up</button>
                    <button className='btn-floating waves-effect waves-light purple btn' onClick={this.addUser}><i className="material-icons">add</i></button>
                </div>
            </div>
        )
    }



}


export default WebRTC