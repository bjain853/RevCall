import React, { Component } from "react"
import { BrowserRouter } from 'react-router-dom'
import "./App.css"
import Navbar from './components/layout/Navbar'

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar/>
          <h3>Welcome to RevCall</h3>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
