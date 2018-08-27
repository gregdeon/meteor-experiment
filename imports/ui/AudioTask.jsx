import React, { Component } from 'react';

import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx'

import {AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString, centsToString} from '../api/utils.js';
import {soundManager} from 'soundmanager2'

export class ScrollingTranscript extends Component {
    scrollToBottom() {
        if(this.text_area){
            this.text_area.scrollTop = this.text_area.scrollHeight;
        }
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return (
            <div className="audio-typed" ref={text_area => this.text_area = text_area}>
                {this.props.words.map((word, idx) => 
                    <div className="audio-typed-word" key={idx}>{word}</div>
                )}
                <div 
                    className="audio-typed-dummy" 
                    ref={(el) => {this.bottom_placeholder = el;}}
                />
            </div>
        );
    }
}

export class PlaybackBar extends Component { 
    render() {
        let time_fraction = this.props.time_elapsed / this.props.total_time;
        let transform = 'scaleX(' + time_fraction + ')';
        return <div className="audio-view">
            <div className="audio-playback"> 
                <div className="audio-playback-filled" style={{
                    transformOrigin: 'top left',
                    transform: transform
                }}/>
            </div>
            <div className="audio-view-bottom">
                <div className="audio-view-time">
                    {secondsToString(this.props.time_elapsed)}   
                </div>
                <div className="audio-view-end">
                    {secondsToString(this.props.total_time)}
                </div>
            </div>
        </div>
    }
}

export class AudioTaskInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: "",
        };
    }

    handleTextInput(event) {
        let new_text = event.target.value;

        // TODO: support \n here? This would require watching for onkeydown instead of oninput 
        if(new_text.endsWith(" ")) {
            let typed_word = new_text.slice(0, -1);
            this.props.onTypedWord(typed_word)

            // Empty the text box again
            new_text = "";
        }

        this.setState({text: new_text});
    }

    render() {
        return <input 
            // autoFocus
            ref="input_field"
            type="text" 
            className="audio-input" 
            value={this.state.text}
            placeholder="Type here"
            onInput={this.handleTextInput.bind(this)} 
        />
    }
}

// Component for the audio task
export class AudioTaskView extends Component {
    handleStartCountdown() {
        // Focus on the text input box here
        this.refs.input_field.refs.input_field.focus();
        this.props.startCountdown();
    }

    renderHeader() {
        if(!this.props.started_countdown) {
            return <div>
                <div className="task-header">Click to start audio clip</div>
                <button onClick={this.handleStartCountdown.bind(this)}>
                    Start Clip
                </button>
            </div>
        }
        else if(this.props.countdown_time > 0) {
            return <div className="task-header">Audio starting in {this.props.countdown_time}...</div>
        }
        else {
            return <div className="task-header">Audio playing...</div>
        }
    }

    render() {
        return (
            <div className="task-container">
                {this.renderHeader()}
                <PlaybackBar time_elapsed={this.props.audio_clip_elapsed} total_time={this.props.audio_clip_length}/>
                <ScrollingTranscript words={this.props.words} />
                <AudioTaskInput ref="input_field" onTypedWord={this.props.onTypedWord}/>
                <div>
                    <br/>
                    Audio not playing? <br/>
                    <button style={{padding: 5}} onClick={this.props.restartAudio}>
                        Restart Audio
                    </button>
                </div>
            </div>
        );
    }
}

const AUDIO_TASK_STATES = {
    WAITING: 0,
    COUNTING_DOWN: 1,
    PLAYING: 2,
    SCORE_SCREEN: 3,
}

// Wrapper to handle stages and timers
export class AudioTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            update_interval: setInterval(
                this.updateState.bind(this),
                250
            ),
            current_stage: AUDIO_TASK_STATES.WAITING,
            /* Hack: make the UI update by changing this */
            update_flag: 0,
        };
    }

    updateState() {
        // Common variables to make JS happy
        let time_elapsed = getSecondsSince(this.props.audio_instance.time_started_task);

        switch(this.state.current_stage) {
            case AUDIO_TASK_STATES.WAITING:
                // Done waiting if they've clicked on the button
                if(this.props.audio_instance.time_started_task) {
                    this.setState({current_stage: AUDIO_TASK_STATES.COUNTING_DOWN});
                }
                return;

            case AUDIO_TASK_STATES.COUNTING_DOWN:
                // Done waiting if enough time has passed
                if(time_elapsed > this.props.audio_task.countdown_length) {
                    this.setState({current_stage: AUDIO_TASK_STATES.PLAYING});
                }
                else {
                    this.setState({update_flag: this.state.update_flag + 1});
                }
                return;

            case AUDIO_TASK_STATES.PLAYING:
                if(time_elapsed > 
                    this.props.audio_task.countdown_length + 
                    this.props.audio_task.audio_length
                ) {
                    // Submit for processing
                    Meteor.call(
                        'audioInstances.startScoreScreen',
                        this.props.audio_task,
                        this.props.audio_instance,
                        new Date(),
                    )

                    this.setState({current_stage: AUDIO_TASK_STATES.SCORE_SCREEN});
                }
                else {
                    this.setState({update_flag: this.state.update_flag + 1});
                }
                return;

            case AUDIO_TASK_STATES.SCORE_SCREEN:
                // We'll never change stages again until advanceWorkflow gets called
                return;
        }
    }

    componentDidMount() {
        // Log entry time here
        if(!this.props.audio_instance.time_entered) {
            Meteor.call(
                'audioInstances.recordTimeEntered', 
                this.props.audio_instance,
                new Date(),
            );
        }
    }

    componentWillUnmount() {
        if(this.state.update_interval) {
            clearInterval(this.state.update_interval);
        }
    }

    handleStartCountdown() {
        Meteor.call(
            'audioInstances.startTask',
            this.props.audio_instance,
            new Date(),
        );
    }

    handleTypedWord(word) {
        // TODO: check current stage first? Can't be on the results screen
        Meteor.call(
            'audioInstances.submitWord', 
            this.props.audio_instance,
            word
        );
    }

    handleSubmit(rating) {
        Meteor.call(            
            'audioInstances.submitRating',
            this.props.audio_instance,
            rating,
            new Date(),
        );
        this.props.finishedCallback();
    }

    // TODO: integrate sound into timing logic
    /*
    in constructor:
            sound_update_interval: setInterval(
                this.updateAudio.bind(this),
                250,
            ),
            sound: null,
            finished_sound: false,

    componentWillUnmount() {
        this.removeSound();
        if(this.state.sound_update_interval)
        {
            clearInterval(this.state.sound_update_interval);
        }    
    }

    createSound(url, finished_callback) {
        this.removeSound();
        let sound = soundManager.createSound({
            //url: '/' + this.props.audio_task.audio_path,
            url: url,
            onfinish: finished_callback,
        });
        this.setState({
            sound: sound,
        });

        return sound;
    }

    removeSound() {
        if(this.state.sound !== null) {
            this.state.sound.destruct();
        }
        this.setState({
            sound: null,
        });
    }

    handleAudioDone() {
        this.setState({
            finished_sound: true,
        });
    }

    updateAudio() {
        // Main function that controls audio
        // If we don't have a sound, load it now
        let sound = this.state.sound;
        let update_state = false;
        if(sound === null) {
            update_state = true;
            sound = this.createSound(
                '/' + this.props.audio_task.audio_path,
                this.handleAudioDone.bind(this)
            );
            sound.load();
        }

        // If we're in the task, play our sound (only once)
        if(
            this.props.audio_instance.state === AudioInstanceStates.TASK
            && sound.playState === 0
            && !this.state.finished_sound
        ) {
            sound.play();
        }

        if(update_state) {
            this.setState({
                sound: sound
            })
        }
    }

    restartAudio() {
        // Don't do anything if the audio hasn't started yet
        if(this.state.sound) {
            this.state.sound.stop();
            if(this.props.audio_instance.state !== AudioInstanceStates.TASK) {
                this.state.sound.setPosition(0)
            }
            else {
                let time_stage = this.props.audio_task.time_s[AudioInstanceStates.TASK];
                let time_elapsed = time_stage - this.props.time_left;
                this.state.sound.setPosition(time_elapsed * 1000);
            }
        }

        this.updateAudio();
    }
    */

    renderCurrentTask() {
        let current_stage = this.state.current_stage;
        let time_elapsed = getSecondsSince(this.props.audio_instance.time_started_task);

        let common_props = {
            words: this.props.audio_instance.words_typed,
            audio_clip_length: this.props.audio_task.audio_length,
            onTypedWord: this.handleTypedWord.bind(this),
            restartAudio: (() => console.log("Clicked on Restart Audio")),
        }

        switch(current_stage) {
            case AUDIO_TASK_STATES.WAITING:
                return <AudioTaskView 
                    started_countdown={false}
                    audio_clip_elapsed={0}
                    startCountdown={this.handleStartCountdown.bind(this)}
                    {...common_props}
                />

            case AUDIO_TASK_STATES.COUNTING_DOWN:
                let time_left = this.props.audio_task.countdown_length - time_elapsed;
                let time_left_pretty = (time_left > 0 ? Math.ceil(time_left) : 0);
                return <AudioTaskView 
                    started_countdown={true}
                    countdown_time={time_left_pretty}
                    audio_clip_elapsed={0}
                    {...common_props}
                />

            case AUDIO_TASK_STATES.PLAYING:
                let time_elapsed_audio = time_elapsed - this.props.audio_task.countdown_length;
                let time_elapsed_pretty = Math.floor(time_elapsed_audio);
                return <AudioTaskView 
                    started_countdown={true}
                    countdown_time={0}
                    audio_clip_elapsed={time_elapsed_pretty}
                    {...common_props}
                />

            case AUDIO_TASK_STATES.SCORE_SCREEN:
                let num_correct_list = this.props.audio_instance.num_correct
                let num_correct = (num_correct_list ? num_correct_list[0b111] : 0)
                return <AudioTaskScoreScreen
                    player_num={3}
                    word_lists={this.props.audio_instance.diffs}
                    total_pay={this.props.audio_instance.total_bonus}
                    total_correct={num_correct}
                    rewards={this.props.audio_instance.bonuses}
                    submitCallback={this.handleSubmit.bind(this)}
                />
        }
    }

    render() {
        return (
            <div id="audio-container">
                {this.renderCurrentTask()}
            </div>
        );            
    }
}