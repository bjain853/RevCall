import React from 'react';

const playVideoFromCamera = (stream) => {

    console.log('Got the stream', stream);
    //playVideoFromCamera();
    const videoElement = document.querySelector('video#localVideo'); //gets the video element 
    if(videoElement.srcObject!==undefined){
       videoElement.srcObject = stream;
    }     // links video element to the src



}


const videoScreen=(props)=>{
    const streamId={props};
    const constraints = {
        'video': true,
        'audio': false
    }
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => { playVideoFromCamera(stream) })
        .catch((err) => {
            console.error(err);
        })


    return (
    <div>
        <video id='localVideo' autoPlay={true} >
        </video>
    </div>);
}

export default videoScreen