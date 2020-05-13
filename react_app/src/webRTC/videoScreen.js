import React from 'react';





class VideoScreen extends React.Component {

    constructor(props) {
        super(props);
        this.videoRef = React.createRef();
    }

    componentDidMount() {
        const { stream } = this.props;
        
        if (stream === null) {
            console.error('No media received');
        } else {
            this.videoRef.current.srcObject = stream;
            this.setState();

        }

    }

    render() {


        return (
            <div className='card blue-grey darken-1'>
                <video ref={this.videoRef} autoPlay />
            </div>);
    }

}

export default VideoScreen