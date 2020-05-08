const playVideoFromCamera = (stream) => {

    console.log('Got the stream', stream);
    //playVideoFromCamera();
    const videoElement = document.querySelector('video#localVideo');
    videoElement.srcObject = stream;



}


export default VideoScreen=(props)=>{
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