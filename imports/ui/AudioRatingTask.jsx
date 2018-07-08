import React, { Component } from 'react';

import {getResultsFromText} from '../api/audioInstances.js';
import {AudioRatingTasks} from '../api/audioRatingTasks.js';
import {centsToString} from '../api/utils.js';

// TODO: this is mainly copied from the AudioTaskScore class in AudioTask.jsx
// Would be best to refactor it to remove duplicate code
export class AudioRatingScreen extends Component {
    handleSubmit(ratings) {
        console.log(this.props);
        /*
        TODO

        Meteor.call(            
            'audioInstances.submitRating',
            this.props.audio_instance._id,
            this.props.player_num,
            ratings
        );
        */
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

    renderRewards(rewards) {
        let total = rewards[3];

        return (
            <div>
                <p>Individual payments: </p>
                <div>TODO</div>
            {/*
                <RewardDisplay
                    rewards={rewards.slice(0, 3)}
                />
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