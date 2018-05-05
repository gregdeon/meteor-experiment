import React, { Component } from 'react';
import {WordSearchStatus, WordSearchScoreBox} from './WordSearchStatus.jsx';
import {getRewards, ScoreModes, RewardModes} from '../api/scoreFunctions.js';
import {getInstanceRewards} from '../api/puzzleInstances.js';
import {centsToString} from '../api/utils.js';

class OneRewardDisplay extends Component {
    getRewardString() {
        if(this.props.percent <= 0) {
            return "";
        }

        if(this.props.percent < 10) {
            return "" + this.props.reward;
        }

        return "P" + (this.props.player + 1) + ": " + this.props.reward + "c";
    }

    render() {
        let cls = "score-option-p" + (this.props.player + 1);
        let width = "" + this.props.percent + "%";
        return (
            <div 
                className={cls}
                style={{width: width}}
            >
                {this.getRewardString()}
            </div>
        );
    }
}

class RewardDisplay extends Component {
    render() {
        let rewards = this.props.rewards;
        let total = 0;
        for(let i = 0; i < rewards.length; i++) {
            total += rewards[i];
        }

        let percents = rewards.map((reward) => (100*reward/total));
        if(total === 0) {
            percents = [33, 34, 33];
        }

        return (
            <div className="score-screen-reward">
            {rewards.map((reward, idx) => {
                return (
                    <OneRewardDisplay 
                        key={idx}
                        player={idx}
                        reward={rewards[idx]}
                        percent={percents[idx]}
                    />
                ); 
            })}
            </div>
        );
    }
}

class RewardForm extends Component {
    constructor (props) {
        super(props);

        this.state = {
            selected_self: null,
            selected_others: null,
            submitted: false,
        };
    }

    handleChangeSelf(val) {
        this.setState({selected_self: val});
    }

    handleChangeOthers(val) {
        this.setState({selected_others: val});
    }

    handleSubmit(event) {
        event.preventDefault();

        Meteor.call(
            'puzzleinstances.submitRating',
            this.props.puzzleinstance._id,
            this.props.player_num,
            {
                self: this.state.selected_self,
                others: this.state.selected_others,
            }
        );

        this.setState({submitted: true});
    }

    renderOptions(group, value, extreme_labels, callback) {
        let option_nums = [1, 2, 3, 4, 5, 6, 7];
        return (
            <div className="score-inputs" key={group}>
                {
                    option_nums.map((num) => {
                        let label = "" + num;
                        if (num === 1) {
                            label = extreme_labels[0] + "\n" + label;
                        }
                        if (num === 4) {
                            label = "Neutral\n" + label;
                        }
                        if (num === 7) {
                            label = extreme_labels[1] + "\n" + label;
                        }
                        return (
                            <div className="score-input" key={num}>
                                <label htmlFor={group + "-" + num}>{label}</label>
                                <br/>
                                <input 
                                    type="radio"
                                    id={group + "-" + num}
                                    name={group}
                                    checked={value === num}
                                    onChange={callback.bind(this, num)}
                                />
                            </div>
                        );
                    })
                }
            </div>
        );
    }

    render() {
        let button_active = (
            this.state.submitted === false &&
            this.state.selected_self !== null &&
            this.state.selected_others !== null
        );
        return (
            <form
                onSubmit={this.handleSubmit.bind(this)}
            >
                <p> How happy are you with your own payment?</p>
                {this.renderOptions(
                    0, 
                    this.state.selected_self, 
                    ["Unhappy", "Happy"],
                    this.handleChangeSelf
                )}
                <p> How fair is this payment to your teammates? </p>
                {this.renderOptions(
                    1, 
                    this.state.selected_others,
                    ["Unfair", "Fair"],
                    this.handleChangeOthers
                )}
                <br/>
                <button
                    className="score-button"
                    type="submit"
                    disabled={!button_active}
                >
                    Submit
                </button>
            </form>
        );
    }
}


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