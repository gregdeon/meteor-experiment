import React, { Component } from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Puzzles} from '../api/puzzles.js';
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
