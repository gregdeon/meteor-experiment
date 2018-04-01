import React, { Component } from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';

class App extends Component {
    render() {
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <div>
                <WordSearchPuzzle 
                    ready={this.props.ready}
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                />
            </div>

        );
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
    ];
    let all_ready = true;
    sub.map((sub_item) => {
        if(!sub_item.ready())
            all_ready = false;
    });

    return {
        ready: all_ready,
        puzzle: Puzzles.findOne(),
        puzzleinstance: PuzzleInstances.findOne(),
    };
})(App);
