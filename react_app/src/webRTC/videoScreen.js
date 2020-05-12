import React from 'react';




class VideoScreen extends React.Component {
   
    constructor(props){
        super(props);
        this.videoRef=React.createRef();
    }

    componentDidMount(){
        const {localStream}=this.props;
        this.videoRef.current.srcObject=localStream;
        this.setState();

    }

    render(){
    

    return (
        <div className='card blue-grey darken-1'>
            <video ref={this.videoRef} autoPlay />
        </div>);
    }
    
}

export default VideoScreen