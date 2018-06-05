import React, { Component } from 'react';

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

export class RewardForm extends Component {
    constructor (props) {
        super(props);

        this.state = {
            selected_satisfied: null,
            selected_self: null,
            selected_others: null,
            submitted: false,
        };
    }


    handleChangeSatisfied(val) {
        this.setState({selected_satisfied: val});
    }

    handleChangeSelf(val) {
        this.setState({selected_self: val});
    }

    handleChangeOthers(val) {
        this.setState({selected_others: val});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.submit_callback({
            satisfied: this.state.selected_satisfied,
            self: this.state.selected_self,
            others: this.state.selected_others,
        });

        /*
        Meteor.call(
            'puzzleinstances.submitRating',
            this.props.puzzleinstance._id,
            this.props.player_num,
            {
                self: this.state.selected_self,
                others: this.state.selected_others,
            }
        );
        */

        this.setState({submitted: true});
    }

    renderOptions(group, value, extreme_labels, callback) {
        let option_nums = [1, 2, 3, 4, 5];
        return (
            <div className="score-inputs" key={group}>
                {
                    option_nums.map((num) => {
                        let label = "" + num;
                        
                        if (num === 1) {
                            label = extreme_labels[0] + "\n" + label;
                        }
                        /*
                        if (num === 3) {
                            label = "Neutral\n" + label;
                        }
                        */
                        if (num === 5) {
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
            this.state.selected_satisfied !== null &&
            this.state.selected_self !== null &&
            this.state.selected_others !== null
        );
        return (
            <form
                onSubmit={this.handleSubmit.bind(this)}
            >
                <p> How satisfied are you with your payment? </p>
                {this.renderOptions(
                    0, 
                    this.state.selected_satisfied, 
                    ["Very unsatisfied", "Very satisfied"],
                    this.handleChangeSatisfied
                )}
                <p> To what extent is your payment justified, given your performance?</p>
                {this.renderOptions(
                    0, 
                    this.state.selected_self, 
                    ["To a small extent", "To a large extent"],
                    this.handleChangeSelf
                )}
                <p> To what extent are your teammates' payments justified, given their performance?</p>
                {this.renderOptions(
                    1, 
                    this.state.selected_others,
                    ["To a small extent", "To a large extent"],
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
