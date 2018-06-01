import React, { Component } from 'react';
import './App.css';

import Game from './Game';

class App extends Component {
  render() {
    return (
      <div className="container" style={{marginTop: 30}}>
        <Game />
      </div>
    );
  }
}

export default App;
