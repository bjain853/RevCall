import React, {Component} from 'react';

import videoScreen from './videoScreen';


class WebRTC extends Component{

    state={
        numUsers:0,
        streams:[]
    }

    addUser=()=>{
        this.numUsers++;
        // displays another menu and we can select from the listed members to add to the current call
    }


    render(){


        return(
            <div className='container'>
            {/* give a stream and get its video element and adjust it in a grid*/}
                <videoScreen streamId={2}/>
                <button className='btn-floating btn-large waves-effect waves-light red' onClick={this.addUser}>
                <i class="material-icons"></i>
                </button>
            </div>
        )
    }


}


export default WebRTC