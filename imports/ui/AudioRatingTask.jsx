import React, { Component } from 'react';

import {RewardDisplay} from './RewardForm.jsx';

import {getResultsFromText} from '../api/audioInstances.js';
import {AudioRatingTasks} from '../api/audioRatingTasks.js';
import {centsToString} from '../api/utils.js';

// TODOLATER: this is mainly copied from the AudioTaskScore class in AudioTask.jsx
// Would be best to refactor it to remove duplicate code
export class AudioRatingScreen extends Component {
    constructor (props) {
        super(props);

        this.state = {
            selected_answer: null,
        };
    }

    handleChangeAnswer(val) {
        this.setState({selected_answer: val});
    }

    handleSubmit(event) {
        // Submit
        event.preventDefault();
        Meteor.call(            
            'audioRatingInstances.submitRating',
            this.props.rating_instance._id,
            this.state.selected_answer,
        );

        // Reset interface
        this.setState({
            selected_answer: null,
        });

        // Move to next stage
        this.props.finishedCallback();
    }

    renderWord(word, found_list, key) {
        let found_divs = found_list.map((word, idx) => {
            let style = {visibility: found_list[idx] ? "visible" : "hidden"}

            return (
                <div 
                    className={"audio-transcript-p" + (idx+1)} 
                    style={style}
                    key={idx}
                />
            );
        });

        let found_any = false;
        for(let i = 0; i < found_list.length; i++) {
            if(found_list[i]) {
                found_any = true;
                break;
            }
        }

        return (
            <div className="audio-transcript-word" key={key}>
                {found_any 
                    ? <div className="audio-transcript-text">
                        {word}
                    </div>
                    : <div className="audio-transcript-missing">
                        ?
                    </div>
                }
                {found_divs}
            </div>
        );
    }

    renderTranscript(results, player_num) {
        let words_correct = results.typed[player_num];

        let diff = results.diffs[player_num];
        let word_divs = diff.map((part, idx) => {
            // Words they typed wrong
            if(part.added) {
                return part.value.map((word, j) => (
                    <div className="audio-transcript-text-wrong" key={idx*1000 + j}>
                        {word}
                    </div>
                ));
            }
            // Words they missed
            else if(part.removed) {
                return part.value.map((word, j) => (
                    <div className="audio-transcript-text-missing" key={idx*1000 + j}>
                        {word}
                    </div>
                ));
            } 
            // Words they typed correctly
            else {
                return part.value.map((word, j) => (
                    <div className="audio-transcript-text" key={idx*1000 + j}>
                        {word}
                    </div>
                ));
            }
        });

        return (
            <div className="audio-transcript">
                {word_divs}
            </div>
        );
    }

    renderAllTranscripts(results, player_num) {
        let transcript_divs = [];
        for(let i = 0; i < 3; i++) {
            transcript_divs.push(this.renderTranscript(results, i));
        }

        let status_divs = [];
        let max_typed = results.anybody_found.length;
        for(let i = 0; i < 3; i++) {
            let num_typed = results.typed[i].length;
            let num_correct = results.typed[i].filter(v => v).length;
            let num_errors = num_typed - num_correct;
            let percent_typed = Math.floor(num_typed / max_typed * 100);
            let percent_correct = num_typed === 0 ? 0 : Math.floor(num_correct / num_typed * 100);
            
            status_divs.push(
                <div className="audio-transcript-stats">
                    <b>words typed: </b>
                    {num_typed + "/" + max_typed + " (" + percent_typed + "%), "}
                    <b>correct: </b>
                    {num_correct + "/" + num_typed + " (" + percent_correct + "%)"}
                </div>
            )
        }

        return (
            <div>
                <div className="audio-transcript-legend" key={-1}>
                    Legend:
                    <div className="audio-transcript-text">correct words</div>-
                    <div className="audio-transcript-text-wrong">incorrect words</div>-
                    <div className="audio-transcript-text-missing">missing words</div>
                </div>
                {transcript_divs.map((div, idx) => {
                    let player_string = "Player " + (idx+1);
                    if(idx === player_num) {
                        player_string += " (you)"
                    }
                    return (
                        <div className="audio-transcript-wrapper" key={idx}>
                            <div className="audio-transcript-player">{player_string}:</div>
                            {status_divs[idx]}
                            {div}
                        </div>
                    )
                })}
            </div>
        );
    }

    renderOptions(question_num, value, extreme_labels, callback) {
        let option_nums = [1, 2, 3, 4, 5];
        return (
            <div className="score-question">
            <div className="score-inputs" key={question_num}>
                {
                    option_nums.map((num) => {
                        let label = "" + num;
                        
                        if (num === 1) {
                            label = extreme_labels[0] + "\n" + label;
                        }
                        if (num === 5) {
                            label = extreme_labels[1] + "\n" + label;
                        }
                        
                        return (
                            <div className="score-input" key={num}>
                                <label htmlFor={question_num + "-" + num}>{label}</label>
                                <br/>
                                <input 
                                    type="radio"
                                    id={question_num + "-" + num}
                                    name={question_num}
                                    checked={value === num}
                                    onChange={callback.bind(this, num)}
                                />
                            </div>
                        );
                    })
                }
            </div>
            </div>
        );
    }

    renderQuestions() {
        let button_active = (this.state.selected_answer !== null);
        return (
            <form
                onSubmit={this.handleSubmit.bind(this)}
            >
                <p>Given the team members' performance, are their payments justified?</p>
                {this.renderOptions(
                    0, 
                    this.state.selected_answer, 
                    ["To a small extent", "To a large extent"],
                    this.handleChangeAnswer
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

    renderRewards(rewards) {
        let total = rewards[3];

        return (
            <div>
                <p>Individual payments: </p>
                <RewardDisplay
                    rewards={rewards.slice(0, 3)}
                />
                {this.renderQuestions()}
            {/*
                <div className="task-header">Questions</div>
                <RewardForm 
                    submit_callback={this.handleSubmit.bind(this)}
                />
            */}
            </div>
        );
    }

    render() {
        let rating_instance = this.props.rating_instance;
        let rating_task = AudioRatingTasks.findOne({_id: rating_instance.task_id});

        let words_truth = rating_task.words_truth;
        let words_typed = rating_task.words_typed;
        let reward_mode = rating_task.reward_mode;

        let results = getResultsFromText(words_truth, words_typed, reward_mode);
        let num_found = results.anybody_found.filter(v => v).length;
        let total_pay = results.payments[3];

        return (
            <div className="task-container">
                <div className="task-header">Results Screen</div>
                {this.renderAllTranscripts(results)}
                <p>The team earned <b>{centsToString(total_pay)}</b> for typing <b>{num_found}</b> correct words (5c per 10 words).</p>
                {this.renderRewards(results.payments)}
            </div>
        );
    }
}