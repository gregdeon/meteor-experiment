import React, { Component } from 'react';

import {AudioRatingScreen} from './AudioTaskScoreScreen.jsx'

import {AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString, centsToString} from '../api/utils.js';
import {processResults} from '../api/audioInstances.js'

const countdown_time_s = 0;

// Wrapper to handle stages and timers
export class AudioRatingTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            update_time_interval: setInterval(
                this.updateTime.bind(this),
                1000
            ),
            time_left: countdown_time_s,
        };
    }

    updateTime() {
        if(this.state.time_left > 0) {
            this.setState({
                time_left: this.state.time_left - 1
            });
        }
    }

    componentWillUnmount() {
        if(this.state.update_time_interval) {
            clearInterval(this.state.update_time_interval);
        }
    }

    handleSubmit(rating) {
        Meteor.call(            
            'audioRatingInstances.submitRating',
            this.props.audio_rating_task,
            rating,
            new Date(),
            this.props.workflow_instance,
        );
        this.props.finishedCallback();
        this.setState({
            time_left: countdown_time_s
        });
    }

    render() {
        console.log(this.props);
        let audio_task = {
            words_truth: this.props.audio_rating_task.words_truth,
            words_p1: this.props.audio_rating_task.words_typed_p1,
            words_p2: this.props.audio_rating_task.words_typed_p2,
            reward_mode: this.props.audio_rating_task.reward_mode,
        }

        let audio_instance = {
            words_typed: this.props.audio_rating_task.words_typed_p3.map((word) => ({word: word, date: null})),
        };

        let results = processResults(audio_task, audio_instance)

        return (
            <div id="audio-container">
                <AudioRatingScreen
                    word_lists={results.diffs}
                    total_pay={results.total_bonus}
                    total_correct={results.num_correct[0b111]}
                    rewards={results.bonuses}
                    reverse_order={this.props.audio_rating_task.reverse_order}
                    submitCallback={this.handleSubmit.bind(this)}
                    time_left={this.state.time_left}
                />
            </div>
        );            
    }
}