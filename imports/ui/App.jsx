import React, { Component } from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Puzzles} from '../api/puzzles.js';

class WordSearchLetter extends Component {
    handleCellHover() {
        this.props.handleCellHover(this.props.x, this.props.y);
    }

    handleCellClick() {
        this.props.handleCellClick(this.props.x, this.props.y);
    }

    render() {
        // Figure out highlighting
        let pos = (this.props.x, this.props.y);
        let classes = 'word-search-letter' 
            + (this.props.highlighted ? ' letter-selected' : '');

        return (
            <div
                className={classes}
                protected-text={this.props.letter}
                onMouseOver={
                    this.handleCellHover.bind(this)
                }
                onClick={
                    this.handleCellClick.bind(this)
                }
            />
        );
    }
}

class WordSearchLine extends Component {
    render() {
        let letters = this.props.line.split('').map((letter, idx) => (
            <WordSearchLetter
                key={idx}
                letter={letter}
                x={idx}
                y={this.props.y}
                highlighted={this.props.highlighted[idx]}
                handleCellHover={this.props.handleCellHover}
                handleCellClick={this.props.handleCellClick}
            />
        ));
        return (
            <div className='word-search-line'>
                {letters}
            </div>
        );
    }
}


class WordSearchPuzzle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selecting: false,
            selection_start: {x: 0, y: 0},
            selection_end: {x: 0, y: 0},
        }
    }

    getHeight() {
        return this.props.puzzle.letters.length;
    }

    getWidth() {
        return this.props.puzzle.letters[0].length;
    }

    getHighlighting() {
        let ret = [];
        // Push default
        for(let y = 0; y < this.getHeight(); y++)
        {
            let line = [];
            for(let x = 0; x < this.getWidth(); x++) {
                line.push(false);
            }
            ret.push(line);
        }

        // If we're not selecting right now, highlight nothing
        if(!this.state.selecting) {
            return ret;
        }
        

        // Get start/end points
        let x1 = this.state.selection_start.x;
        let y1 = this.state.selection_start.y;
        let x2 = this.state.selection_end.x;
        let y2 = this.state.selection_end.y;

        // Get direction
        let dx = x2 - x1;
        let dy = y2 - y1;
        let nx = Math.sign(dx);
        let ny = Math.sign(dy);
        let len = Math.max(Math.abs(dx), Math.abs(dy)) + 1;

        // Loop through selection
        let x = x1;
        let y = y1;
        for(let i = 0; i < len; i++) {
            ret[y][x] = true;
            x += nx;
            y += ny;
        }

        return ret;
    }

    checkStraightLine(x1, y1, x2, y2) {
        let dx = x1 - x2
        let dy = y1 - y2

        // Horizontal
        if(dx == 0 || dy == 0) {
            return true;
        }

        // Diagonal
        if(dx == dy || dx == -dy) {
            return true;
        }

        // Otherwise
        return false;
    }

    handleCellHover(x, y) {
        if(!this.state.selecting) {
            var new_start = {x: x, y: y};
            var new_end = {x: x, y: y};
            this.setState({
                selection_start: new_start,
                selection_end: new_end,
            });
        } else {
            var start_x = this.state.selection_start.x;
            var start_y = this.state.selection_start.y;
            if(this.checkStraightLine(start_x, start_y, x, y)) {
                var new_end = {x: x, y: y};
                this.setState({
                    selection_end: new_end,
                });
            }
        }
    }

    handleCellClick(x, y) {
        this.handleCellHover(x, y);

        if(!this.state.selecting) {
            this.setState({
                selecting: true,
            });
        } else {
            this.handleSelectedWord();
            this.setState({
                selecting: false,
            })
        }
    }

    handleSelectedWord() {
        console.log("TODO");
    }

    render() {
        if(!this.props.ready) {
            return null;
        }
        let highlighted = this.getHighlighting();

        let lines = this.props.puzzle.letters.map((line, idx) => (
            <WordSearchLine
                key={idx}
                y={idx}
                line={line}
                highlighted={highlighted[idx]}
                handleCellHover={this.handleCellHover.bind(this)}
                handleCellClick={this.handleCellClick.bind(this)}
            />
        ));
        return (
            <div className='word-search-grid'>
                {lines}
            </div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div>
                <WordSearchPuzzle 
                    ready={this.props.ready}
                    puzzle={this.props.puzzle}
                />
            </div>

        );
    }
}

export default withTracker(() => {
    const sub = Meteor.subscribe('puzzles');
    return {
        ready: sub.ready(),
        puzzle: Puzzles.findOne(),
    };
})(App);
