import React, { Component } from 'react';
import {WordSearchGrid} from './WordSearchGrid.jsx';
import {WordSearchStatus, WordSearchScoreBox, WordSearchTime} from './WordSearchStatus.jsx';
import {WordSearchScoreScreen} from './WordSearchScoreScreen.jsx';
import {PuzzleInstanceStates} from '../api/puzzleInstances.js';

// Export helper classes for admin view
export class PuzzleView extends Component {
    render() {
        return (
            <div id="puzzle-hide-overflow">
            <div id="puzzle-outer">
            <div id="puzzle-inner">
            {/* Hack to center the game*/}

            <div className="word-search-container-left">
                <WordSearchTime
                    time_left={this.props.time_left}
                />
                <WordSearchStatus
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                    player_num={this.props.player_num}
                />
                <WordSearchScoreBox 
                    puzzle={this.props.puzzle}
                    puzzle_instance={this.props.puzzleinstance}
                />
            </div>
            <div className='word-search-container-right'>
                <WordSearchGrid
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                    player_num={this.props.player_num}
                />
            </div>

            </div>
            </div>
            </div>
        )
    }
}

export class WordSearchPuzzle extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time_left_countdown: this.props.puzzle.seconds_countdown,
            time_left_puzzle: this.props.puzzle.seconds_puzzle,
            time_left_score: this.props.puzzle.seconds_score,
            update_interval: setInterval(
                this.updateTimeLeft.bind(this),
                500,
            ),
        };
    }

    componentWillUnmount() {
        clearInterval(this.state.update_interval);
    }

    getTimeInCountdown() {
        let time_started = this.props.puzzleinstance.time_started_countdown;
        let time_now = new Date();
        let diff_ms = Math.abs(time_now - time_started);
        let diff_s = (diff_ms / 1000);
        return diff_s;
    }

    getTimeInPuzzle() {
        let time_started = this.props.puzzleinstance.time_started_puzzle;
        let time_now = new Date();
        let diff_ms = Math.abs(time_now - time_started);
        let diff_s = (diff_ms / 1000);
        return diff_s;
    }

    getTimeInScore() {
        let time_finished = this.props.puzzleinstance.time_started_score;
        let time_now = new Date();
        let diff_ms = Math.abs(time_now - time_finished);
        let diff_s = (diff_ms / 1000);
        return diff_s;
    }

    updateTimeLeft() {
        let time_now = new Date();        
        if(this.props.puzzleinstance.time_started_countdown) {
            let diff_s = Math.floor(this.getTimeInCountdown());

            let left_s = this.props.puzzle.seconds_countdown - diff_s;
            this.setState({time_left_countdown: left_s})
        }
        if(this.props.puzzleinstance.time_started_puzzle) {
            let diff_s = Math.floor(this.getTimeInPuzzle());

            let left_s = this.props.puzzle.seconds_puzzle - diff_s;
            this.setState({time_left_puzzle: left_s})
        }
        if(this.props.puzzleinstance.time_started_score) {
            let diff_s = Math.floor(this.getTimeInScore());

            let left_s = this.props.puzzle.seconds_score - diff_s;
            this.setState({time_left_score: left_s})
        }
    }

    checkCountdownDone() {
        // Done if time is up
        if(!this.props.puzzleinstance.time_started_countdown)
            return false;

        if(this.getTimeInCountdown() > this.props.puzzle.seconds_countdown)
            return true;

        return false;
    }

    checkPuzzleDone() {
        // Done if time is up
        if(!this.props.puzzleinstance.time_started_puzzle)
            return false;

        if(this.getTimeInPuzzle() > this.props.puzzle.seconds_puzzle)
            return true;
        
        // or if all words found
        let found = this.props.puzzleinstance.found;
        for(let i = 0; i < found.length; i++) {
            if(!found[i])
                return false;
        }
        return true;
    }

    checkScoreDone() {
        // Done if time is up
        if(!this.props.puzzleinstance.time_started_score)
            return false;

        if(this.getTimeInScore() > this.props.puzzle.seconds_score) 
            return true;

        // Also done if all submitted ratings
        // TODO don't hardcode 3 players
        for(let i = 0; i < 3; i++) {
            if(this.props.puzzleinstance.ratings[i] === null)
                return false;
        }
        return true;
    }

    renderWaiting() {
        return (
            <div className="word-search-text-container">
                Game starting in {Math.ceil(this.state.time_left_countdown)}...
            </div>
        );
    }

    renderPlaying() {
        return (
            <PuzzleView 
                puzzle={this.props.puzzle}
                puzzleinstance={this.props.puzzleinstance}
                player_num={this.props.player_num}
                puzzle_num={this.props.puzzle_num}
                time_left={this.state.time_left_puzzle}
            />
        )
    }

    renderScoreScreen() {
        return (
            <WordSearchScoreScreen 
                puzzle={this.props.puzzle}
                puzzleinstance={this.props.puzzleinstance}
                player_num={this.props.player_num}
                puzzle_num={this.props.puzzle_num}
                time_left={this.state.time_left_score}
            />
        );
    }
    

    renderFinished() {
        return (
            <div className="word-search-text-container">
                Game over. Moving to next round...
            </div>
        );
    }

    render() {
        let debug = false;
        if(debug) {
            return (
                <div>
                    {this.renderWaiting()}
                    <hr />
                    {this.renderPlaying()}
                    <hr />
                    {this.renderScoreScreen()}
                    <hr />
                    {this.renderFinished()}
                </div>
            );
        }
 
        if(!this.props.puzzleinstance.time_left_countdown) {
            Meteor.call(
                'puzzleinstances.startCountdown', 
                this.props.puzzleinstance._id,
            );
        }


        let state = this.props.puzzleinstance.state;
        // Check puzzle finished
        switch(state) {
            case PuzzleInstanceStates.WAITING:
                if(this.checkCountdownDone()) {            
                    // TODO: check that this works right
                    Meteor.call(
                        'puzzleinstances.startPuzzle', 
                        this.props.puzzleinstance._id,
                    );
                }
                break;

            case PuzzleInstanceStates.PUZZLE:
                if(this.checkPuzzleDone()) {
                    Meteor.call(
                        'puzzleinstances.startScore',
                        this.props.puzzleinstance._id,
                    );
                }
                break;

            case PuzzleInstanceStates.SCORE:
                if(this.checkScoreDone()) {
                    Meteor.call(
                        'puzzleinstances.finishAllSteps',
                        this.props.puzzleinstance._id,
                    );
                }
                break;

            case PuzzleInstanceStates.FINISHED:
                console.log("Calling finished callback")
                console.log(this.props)
                this.props.finishedCallback();
        }

        // Render
        switch(state) {
            case PuzzleInstanceStates.WAITING:
                return this.renderWaiting();

            case PuzzleInstanceStates.PUZZLE:
                return this.renderPlaying();

            case PuzzleInstanceStates.SCORE:
                return this.renderScoreScreen();

            case PuzzleInstanceStates.FINISHED:
                return this.renderFinished();
        }
    }
}