import React, { Component } from 'react';
import {WordSearchGrid} from './WordSearchGrid.jsx';
import {WordSearchStatus} from './WordSearchStatus.jsx';
import {WordSearchScoreScreen} from './WordSearchScoreScreen.jsx';
import {PuzzleInstanceStates} from '../api/puzzleInstances.js';

export class WordSearchPuzzle extends Component {
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
                />
                </div>
                <WordSearchGrid
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
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
        console.log(this.props.puzzleinstance);
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

        switch(this.props.puzzleinstance.state) {
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