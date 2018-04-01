import React, { Component } from 'react';

// Highlighting types 
const LetterHighlights = {
    NONE: 0,
    SELECTED: 1,
    FOUND_P1: 2,
    FOUND_P2: 3,
    FOUND_P3: 4,
};

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
        let highlight_class = '';
        switch (this.props.highlighted) {
            case LetterHighlights.SELECTED:
                highlight_class = 'letter-selected';
                break;
            case LetterHighlights.FOUND_P1:
                highlight_class = 'letter-found-p1';
                break;
            case LetterHighlights.FOUND_P2:
                highlight_class = 'letter-found-p2';
                break;
            case LetterHighlights.FOUND_P3:
                highlight_class = 'letter-found-p3';
                break;
        }
        let classes = 'word-search-letter ' + highlight_class;

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


export class WordSearchGrid extends Component {
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

    addSelectionHighlighting(arr) {
        // If we're not selecting right now, highlight nothing
        if(!this.state.selecting) {
            return arr;
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
            arr[y][x] = LetterHighlights.SELECTED;
            x += nx;
            y += ny;
        }

        return arr;
    }

    addWordHighlighting(arr, word_num) {
        let word = this.props.puzzle.words[word_num];
        let found = this.props.puzzleinstance.found[word_num];
        
        if(!found) {
            return arr;
        }

        let x = word.x;
        let y = word.y;
        let val = LetterHighlights.FOUND_P1 + word.player;
        for(let i = 0; i < word.len; i++) {
            arr[y][x] = val;
            x += word.dx;
            y += word.dy;
        }

        return arr;
    }

    getHighlighting() {
        let ret = [];
        // Push default
        for(let y = 0; y < this.getHeight(); y++)
        {
            let line = [];
            for(let x = 0; x < this.getWidth(); x++) {
                line.push(LetterHighlights.NONE);
            }
            ret.push(line);
        }

        // Add words
        for(let i = 0; i < this.props.puzzle.words.length; i++) {
            ret = this.addWordHighlighting(ret, i);
        }

        // Add selected letters
        ret = this.addSelectionHighlighting(ret);

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
        Meteor.call(
            'puzzleinstances.findWord', 
            this.props.puzzleinstance._id,
            this.state.selection_start,
            this.state.selection_end
        );
    }

    render() {
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