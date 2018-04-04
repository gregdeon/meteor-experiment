import React, { Component } from 'react';
import {WordSearchGrid} from './WordSearchGrid.jsx';
import {WordSearchStatus} from './WordSearchStatus.jsx';
import {WordSearchScoreScreen} from './WordSearchScoreScreen.jsx';
import {PuzzleInstanceStates} from '../api/puzzleInstances.js';

export class WordSearchPuzzle extends Component {
    constructor(props) {
        super(props);

        this.state = {
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

    updateTimeLeft() {
        let time_now = new Date();
        if(this.props.puzzleinstance.time_started) {
            let time_started = this.props.puzzleinstance.time_started;
            let diff_ms = Math.abs(time_now - time_started);
            let diff_s = Math.floor(diff_ms / 1000);

            let left_s = this.props.puzzle.seconds_puzzle - diff_s;
            this.setState({time_left_puzzle: left_s})
        }
        if(this.props.puzzleinstance.time_finished) {
            let time_finished = this.props.puzzleinstance.time_finished;
            let diff_ms = Math.abs(time_now - time_finished);
            let diff_s = Math.floor(diff_ms / 1000);

            let left_s = this.props.puzzle.seconds_score - diff_s;
            this.setState({time_left_score: left_s})
        }
    }

    checkPuzzleDone() {
        // Done if time is up
        if(this.state.time_left_puzzle <= 0) {
            return true;
        }

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
        if(this.state.time_left_score <= 0) {
            return true;
        }

        // TODO: check that all submitted ratings
        return false
    }

    renderWaiting() {
        return (
            <div className="word-search-text-container">
                Waiting for game to begin...
            </div>
        );
    }

    renderPlaying() {
        return (
            <div id="puzzle-hide-overflow">
            <div id="puzzle-outer">
            <div id="puzzle-inner">
            {/* Hack to center the game*/}

            <div className='word-search-puzzle-container'>
                <div className="word-search-status">
                <WordSearchStatus
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                    player_num={this.props.player_num}
                    puzzle_num={this.props.puzzle_num}
                    time_left={this.state.time_left_puzzle}
                />
                </div>
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

    renderScoreScreen() {
        return (
            <WordSearchScoreScreen 
                puzzle={this.props.puzzle}
                puzzleinstance={this.props.puzzleinstance}
                player_num={this.props.player_num}
                puzzle_num={this.props.puzzle_num}
                time_left={this.props.time_left_score}
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

        // We're doing the puzzle now, so save start time
        if(!this.props.puzzleinstance.time_started) {
            Meteor.call(
                'puzzleinstances.startPuzzle', 
                this.props.puzzleinstance._id,
            );
        }

        let state = this.props.puzzleinstance.state;
        // Check puzzle finished
        switch(state) {
            case PuzzleInstanceStates.PUZZLE:
                if(this.checkPuzzleDone()) {
                    Meteor.call(
                        'puzzleinstances.finishPuzzle',
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