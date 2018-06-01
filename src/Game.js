import React, { Component } from 'react';
import _ from 'lodash';


// function to check if there is a possible combination of numbers left
// which when summed up are equal to the current number of stars
var possibleCombinationSum = function(arr, n) {

    if (arr.indexOf(n) >= 0) { return true; }

    if (arr[0] > n) { return false; }

    if (arr[arr.length - 1] > n) {
      arr.pop();
      return possibleCombinationSum(arr, n);
    }

    var listSize = arr.length, combinationsCount = (1 << listSize)

    for (var i = 1; i < combinationsCount ; i++ ) {
      var combinationSum = 0;
      for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }

    return false;
};
  


// Component to show before starting the game, informing about time to finish the game,
// with button to start 
const BeforeStart = (props) => {
    return (
        <div className="container card text-center">
        <div style={{margin: 30}}>
            <h3>You have {props.timer} s to finish the game.</h3>
            <br/>
            <button className="btn btn-success" onClick={props.startGame}>
                    <i className="fa fa-play"></i> Let's play!
            </button>
        </div>
        </div>
    );
};
  


// Showing the random number of stars from 1 to 9, using Lodash utility library
const Stars = (props) => {
    return(
        <div className="col-5">
            {_.range(props.numberOfStars).map(i =>
            <i key={i} className="fa fa-star"></i>
        )}
        </div>
    );
};
  


// Component for buttons 1) to check and accept the answer 2) to redraw when possible
const Button = (props) => {
    let button;
    switch(props.answerIsCorrect) {
        case true:
            button = 
            <button className="btn btn-success" onClick={props.acceptAnswer}>
                <i className="fa fa-check"></i>
            </button>;
        break;
        case false:
            button = 
            <button className="btn btn-danger">
                <i className="fa fa-times"></i>
            </button>;
        break;
        default:
            button = 
            <button className="btn"
                    onClick={props.checkAnswer}
                    disabled={props.selectedNumbers.length === 0}>
                =
            </button>;
        break;
    }
    return(
        <div className="col-2 text-center">
            {button}
        <br/><br/>
        <button className="btn btn-warning btn-sm"
                        onClick={props.redraw}
                disabled={props.redraws === 0 || props.doneStatus}
                style={{fontSize: 12}}>
            <i className="fa fa-sync"></i> {props.redraws}
        </button>
        <br/><br/>
        </div>
    );
};
  


// Showing selected numbers next to the stars and buttons
const Answer = (props) => {
    return(
        <div className="col-5">
            {props.selectedNumbers.map((number, i) =>
            <span key={i} onClick={() => props._deleteNumber(number)}>
                {number}
            </span>
        )}
        </div>
    );
};
  


// Showing all numbers form 1 to 9 and changing the appearance of numbers
// according to their state (available, currently chosen, used) 
const Numbers = (props) => {
    const _numberClassName = (number) => {
    if (props.usedNumbers.indexOf(number) >= 0) {
        return "used";
    }
    if (props.selectedNumbers.indexOf(number) >= 0) {
        return "selected";
    }
    };
    return (
        <div className="container card text-center">
            <div>
                {Numbers.list.map((number, i) =>
                <span key={i} className={_numberClassName(number)}
                    onClick={() => props.selectNumber(number)}>
                {number}
            </span>
            )}
        </div>
        </div>
    );
};

// Globally generating the list of numbers from 1 to 9 using Lodash
Numbers.list = _.range(1, 10);
  


// Showing the game result depending on game done status
// and button to reset the game
const DoneFrame = (props) => {
    return (
        <div className="container text-center">
            <br/>
            <h2>{props.doneStatus}</h2>
        <button className="btn btn-secondary" onClick={props.resetGame}>
            Play Again
        </button>
        </div>
    );
};
  


// Showing time left
const Timer = (props) => {
    const remainingTime = (time) => {
    if (time >= 0) {
        return " " + time + " s";
    }
    if (time < 0) {
        return " Time is out!";
    }
    };
    return (
        <div className="container">
            <div className="float-right">
            <i className="fa fa-stopwatch"></i>
            {remainingTime(props.timer)}
        </div>
        </div>
    );
};

class Game extends Component {

    // generating random number of stars from 1 to 9
    static randomNumber = () => 1 + Math.floor(Math.random()*9);
    
    // initial state of the game
    static initialState = () => ({
        gameStarted: false,
        selectedNumbers: [],
        randomNumberOfStars: Game.randomNumber(),
        usedNumbers: [],
        answerIsCorrect: null,
        redraws: 5,
        doneStatus: null,
        timer: 30
    });

    // setting the initial state from static variable
    state = Game.initialState();
    
    // when start button from BeforeStart is clicked
    _startGame = () => {
        // game is started
        this.setState({
            gameStarted: true
        });
        // timer triggered
        this.timerID = setInterval(
            () => this._tick(),
            1000
        );
        // timeout setup
        this.timeout = setTimeout(
            (() => {
                clearInterval(this.timerID);
                this.setState({doneStatus: "Game over"})
            }),
            // + 1 to finish the game after 0 is showed from timer
            (this.state.timer + 1)*1000
        );
    };

    // checking if clicked (selected number) is correct
    _selectNumber = (clickedNumber) => {
        // if the number is already selected do nothing
        if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0) { return; }
        // add the number to selected numbers state array
        this.setState(prevState => ({
            // making sure that the answer is 'no answer' or resetting
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
        }));
    };

    // deleting selected number from selected numbers array state
    _deleteNumber = (numberToDelete) => {
        this.setState(prevState => ({
            // making sure that the answer is 'no answer' or resetting
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers
                .filter(number => number !== numberToDelete)
        }));
    };

    // checking if selected number or sum of selected numbers is equal to the current number of stars
    // and setting the answer to true/false
    _checkAnswer = () => {
        this.setState(prevState => ({
            answerIsCorrect: prevState.randomNumberOfStars ===
            prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
        }));
    };

    // if the answer is true
    _acceptAnswer = () => {
        this.setState(prevState => ({
            // add the selected numbers to 'used numbers' array
            usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
            // and clear selected numbers
            selectedNumbers: [],
            // make sure that the answer is 'no answer' or resetting
            answerIsCorrect: null,
            // get new random number of stars
            randomNumberOfStars: Game.randomNumber()
        }), 
        // and update done status after state changes
        this._updateDoneStatus);
    };

    // redrawing 
    _redraw = () => {
        // if the number of redraws is 0 do nothing
        if (this.state.redraws === 0 ) { return; }
        this.setState(prevState=> ({
            // get new random number of stars
            randomNumberOfStars: Game.randomNumber(),
            // make sure that the answer is 'no answer' or resetting
            answerIsCorrect: null,
            // clear selected numbers
            selectedNumbers: [],
            // decrease number of redraws available
            redraws: prevState.redraws - 1
        }),
        // and update done status after state changes
        this._updateDoneStatus);
    };

    // check if there are any possible solutions
    _possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
        // check which number are not in usedNumbers array
        const possibleNumbers = _.range(1, 10).filter(number =>
            usedNumbers.indexOf(number) === -1
        );
        // call a function to check if there is correct answer possible from available numbers
        return possibleCombinationSum(possibleNumbers, randomNumberOfStars);
    };

    // finishing the game
    _updateDoneStatus = () => {
        this.setState(prevState => {
            // if all numbers are used
            if (prevState.usedNumbers.length === 9) {
                // stop the time
                clearInterval(this.timerID);
                clearTimeout(this.timeout);
                // win
                return { doneStatus: "Done. Nice!" };
            }
            // if there are no redraws and no possible solutions
            if ( prevState.redraws === 0 && !this._possibleSolutions(prevState) ) {
                // stop the time
                clearInterval(this.timerID);
                clearTimeout(this.timeout);
                // lose
                return { doneStatus: "Game Over!" };
            }
        });
    };

    // resetting the game to the initial state
    _resetGame = () => this.setState(Game.initialState());

    // decreasing the time left
    _tick = () => {
        this.setState(prevState => ({
            timer: prevState.timer - 1
        }))
    };

	render() {

        const {
            gameStarted,
            selectedNumbers,
            randomNumberOfStars,
            answerIsCorrect,
            usedNumbers,
            redraws,
            doneStatus,
            timer } = this.state;

        return (

            <div className="container">
                <div className="float-left"><h3>Play Nine</h3></div>
                <Timer timer={timer}
                        doneStatus={doneStatus}
                        updateDoneStatus={this._updateDoneStatus}/>
                <br/><br/>
                <hr />
                {/* 
                    if gameStarted is true start the game and show all components,
                    if false show BeforeStart component
                */}
                {gameStarted ?
                    <div className="row">
                        <Stars numberOfStars={randomNumberOfStars}/>
                        <Button selectedNumbers={selectedNumbers}
                                checkAnswer={this._checkAnswer}
                                answerIsCorrect={answerIsCorrect}
                                acceptAnswer={this._acceptAnswer}
                                redraw={this._redraw}
                                redraws={redraws}
                                doneStatus={doneStatus}/>
                        <Answer selectedNumbers={selectedNumbers}
                                _deleteNumber={this._deleteNumber}/>
                        <br /><br />
                        {/*
                            if the doneStatus has some value show DoneFrame component
                            if there is no value show numbers for selection
                        */}
                        {doneStatus ?
                            <DoneFrame doneStatus={doneStatus}
                                    resetGame={this._resetGame}/> :
                            <Numbers selectedNumbers={selectedNumbers}
                                    selectNumber={this._selectNumber}
                                    usedNumbers={usedNumbers}/>
                        }       
                    </div> : <BeforeStart timer={timer} startGame={this._startGame}/>
                }
            </div>

        );
    }
}

export default Game;