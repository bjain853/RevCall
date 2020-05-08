import React, { Component } from 'react';

class Webcam extends Component {

    numUsers=1;
   constructor(props){
       super(props);
       this.streamCamVideo=this.streamCamVideo.bind(this);
   }

    // handleVideo = (stream) => {
    //     const mediaStream = new MediaStream();
    //     const video = stream;
    //     console.log(stream);
    //     this.setState({
    //         videoSrc: stream
    //     })
    // }

    addUser=()=>{
        this.numUsers++;
        this.streamCamVideo();
    }
    streamCamVideo=()=>{
        

        var constraints={audio:true,video:{width:window.screen.width/this.numUsers,height:window.screen.height/this.numUsers}};
        navigator.mediaDevices.getUserMedia(constraints).then((mediaStream)=>{
            var video = document.querySelector('video');
            video.srcObject=mediaStream;
            video.onloadedmetadata= (e)=>{
                video.play();
            }
        }).catch((err)=>{
            console.log(err);
        })
    }


    render() {
        return (
            <div>
                <div id='container'>
                    <video autoPlay={true} id='videoElement controls' />
                </div>
                <br />
                <button onClick={this.streamCamVideo}>Start Streaming</button>
                <button onClick={this.addUser}>Add User</button>

            </div>
        )
    }

    // componentDidMount = () => {
    //     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.moxGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
    //     if (navigator.getUserMedia) {
    //         navigator.getUserMedia({ video: true }, this.handleVideo, this.videoError);
    //     }
    // }


}

export default Webcam