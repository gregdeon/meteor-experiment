// Specific UI for the score screen at the end of each transcription task
import React, { Component } from 'react';

import {DIFF_STATES} from '../api/audioInstances.js';
import {RewardDisplay, RewardQuestions, ExternalRewardQuestions} from './RewardForm.jsx';
import {centsToString} from '../api/utils.js';

import './AudioTaskScoreScreen.css';

export class AudioTranscriptStatusBar extends Component {
    render() {
        let num_words = this.props.num_words;
        let num_typed = this.props.num_typed;
        let num_correct = this.props.num_correct;

        let percent_typed = Math.floor(num_typed / num_words * 100);
        let percent_correct = num_typed === 0 ? 0 : Math.floor(num_correct / num_typed * 100);
        
        return <div className="audio-transcript-stats">
            <b>words typed: </b>
            {num_typed + "/" + num_words + " (" + percent_typed + "%), "}
            <b>correct: </b>
            {num_correct + "/" + num_typed + " (" + percent_correct + "%)"}
        </div>
    }
}

export class AudioTranscriptText extends Component {
    render() {
        let class_lookup = {
            [DIFF_STATES.CORRECT]: 'audio-transcript-text',
            [DIFF_STATES.INCORRECT]: 'audio-transcript-text-wrong',
            [DIFF_STATES.NOT_TYPED]: 'audio-transcript-text-missing'
        }

        return <div className="audio-transcript">
            {this.props.words.map((word, idx) => {
                let div_class = class_lookup[word.state];
                return <div key={idx} className={div_class}>
                    {word.text}
                </div>
            })}
        </div>
    }
}

export class AudioTranscript extends Component {
    render() {
        let player_string = "Worker " + (this.props.player_num);
        if(this.props.is_user) {
            player_string += " (you)"
        }

        let num_words = this.props.words.filter(
            v => v.state == DIFF_STATES.CORRECT || v.state == DIFF_STATES.NOT_TYPED
        ).length;
        let num_typed = this.props.words.filter(
            v => v.state == DIFF_STATES.CORRECT || v.state == DIFF_STATES.INCORRECT
        ).length;
        let num_correct = this.props.words.filter(
            v => v.state == DIFF_STATES.CORRECT
        ).length;

        return <div className="audio-transcript-wrapper">
            <div className="audio-transcript-player">
                {player_string}:
            </div>
            <AudioTranscriptStatusBar
                num_words={num_words}
                num_typed={num_typed}
                num_correct={num_correct}
            />
            <AudioTranscriptText
                words={this.props.words}
            />
        </div>
    }
}

export class AudioTranscriptLegend extends Component {
    render() {
        return <div className="audio-transcript-legend" key={-1}>
            <div className="audio-transcript-legend-top"><b>Legend:</b></div>
            <div className="audio-transcript-text">correct words</div>
            —
            <div className="audio-transcript-text-wrong">incorrect words</div>
            —
            <div className="audio-transcript-text-missing">untyped words</div>
        </div>
    }
}

export class AudioTaskScoreScreen extends Component {
    render() {
        // Use bonuses to check if results are ready yet
        if(!this.props.rewards) {
            return <div className="task-container">
                <div className="task-header">Audio clip finished!</div>
                <p>Processing results...</p>
            </div>
        }
        else {
            return (
                <div className="task-container">
                    <div className="task-header">Audio clip finished!</div>
                    <AudioTranscriptLegend/>
                    {this.props.word_lists.map((word_list, idx) => (
                        <AudioTranscript
                            key={idx}
                            player_num={idx+1}
                            is_user={idx+1 == this.props.player_num}
                            words={word_list}
                        />
                    ))}
                    <p>Your team earned <b>{centsToString(this.props.total_pay)}</b> for typing <b>{this.props.total_correct}</b> correct words (5c per 10 words).</p>
                    <p>Individual payments: </p>
                    <RewardDisplay
                        rewards={this.props.rewards}
                    />
                    <RewardQuestions
                        submit_callback={this.props.submitCallback}
                    />
                </div>
            );
        }
    }
}

// AudioRatingScreen: similar to score screen, but for external raters
export class AudioRatingScreen extends Component {
    render() {
        return (
            <div className="task-container">
                <div className="task-header">Audio transcription results</div>
                <AudioTranscriptLegend/>
                {this.props.word_lists.map((word_list, idx) => (
                    <AudioTranscript
                        key={idx}
                        player_num={idx+1}
                        words={word_list}
                    />
                ))}
                <p>The team earned <b>{centsToString(this.props.total_pay)}</b> for typing <b>{this.props.total_correct}</b> correct words (5c per 10 words).</p>
                <p>Individual payments: </p>
                <RewardDisplay
                    rewards={this.props.rewards}
                />
                <ExternalRewardQuestions
                    submit_callback={this.props.submitCallback}
                    time_left={this.props.time_left}
                />
            </div>
        );
    }
}