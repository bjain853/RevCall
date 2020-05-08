import React, { Component } from "react"
import { BrowserRouter, Switch, Link } from 'react-router-dom'
import "./App.css"
import Navbar from './components/layout/Navbar'
import WebRTC from './webRTC/webRTC';
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <h3>Welcome to RevCall</h3>
          <Switch>
            <Route path='/videocalls'><WebRTC /></Route>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
