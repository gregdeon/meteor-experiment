import React, { Component } from 'react';
import {WordSearchStatus, WordSearchScoreBox} from './WordSearchStatus.jsx';
import {getRewards, ScoreModes, RewardModes} from '../api/scoreFunctions.js';
import {getInstanceRewards} from '../api/puzzleInstances.js';
import {centsToString} from '../api/utils.js';

export class WordSearchScoreScreen extends Component {
    render() {
        let rewards = getInstanceRewards(
            this.props.puzzleinstance,
        );
        let total = 0;
        for(let i = 0; i < rewards.length; i++)
            total += rewards[i];

        return (
            <div className='score-screen-container'>
                <h1>Game Over!</h1>
                <p>Team Bonus: {centsToString(total)} </p>
                <div className='score-screen-status'>
                    <WordSearchStatus
                        puzzle={this.props.puzzle}
                        puzzleinstance={this.props.puzzleinstance}
                        player_num={this.props.player_num}
                        puzzle_num={this.props.puzzle_num}
                        time_left={0}
                    />
                    <WordSearchScoreBox
                        puzzle={this.props.puzzle}
                        puzzle_instance={this.props.puzzleinstance}
                    />
                </div>
                <p>Individual Payments: </p>
                <RewardDisplay
                    rewards={rewards}
                />
                <RewardForm
                    puzzleinstance={this.props.puzzleinstance}
                    player_num={this.props.player_num}
                />
                <p>The next task will start in {this.props.time_left} seconds or as soon as all players submit their ratings.</p>
                {this.props.puzzleinstance.ratings.map((rating, idx) => {
                    return (
                        <p key={idx}>Player {idx+1}: {rating !== null ? "✔" : "✖"}</p>
                    );
                })}
            </div>
        );
    }
}