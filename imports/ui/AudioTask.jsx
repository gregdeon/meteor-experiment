import React, { Component } from 'react';
//import Sound from 'react-sound';

import {RewardDisplay, RewardQuestions} from './RewardForm.jsx';
import {DIFF_STATES, AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString, centsToString} from '../api/utils.js';
import {soundManager} from 'soundmanager2'

import './AudioTask.css';

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

// TODO: use this in other components
export class AudioTranscriptText extends Component {
    render() {
        let class_lookup = {
            [DIFF_STATES.CORRECT]: 'audio-transcript-text',
            [DIFF_STATES.INCORRECT]: 'audio-transcript-text-wrong',
            [DIFF_STATES.NOT_TYPED]: 'audio-transcript-text-missing'
        }

        return <div className="audio-transcript">
            {this.props.words.map((word, idx) => {
                let div_class = class_lookup[word.status];
                return <div key={idx} className={div_class}>
                    {word.text}
                </div>
            })}
        </div>
    }
}

export class AudioTranscript extends Component {
    render() {
        let player_string = "Player " + (this.props.player_num);
        if(this.props.is_user) {
            player_string += " (you)"
        }

        let num_words = this.props.words.filter(
            v => v.status == DIFF_STATES.CORRECT || v.status == DIFF_STATES.NOT_TYPED
        ).length;
        let num_typed = this.props.words.filter(
            v => v.status == DIFF_STATES.CORRECT || v.status == DIFF_STATES.INCORRECT
        ).length;
        let num_correct = this.props.words.filter(
            v => v.status == DIFF_STATES.CORRECT
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
        /* TODO: move this into audio task wrapper
        let results = getInstanceResults(this.props.audio_instance);
        let num_found = results.anybody_found.filter(v => v).length;
        let total_pay = results.payments[3];
        */
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
                    submit_callback={console.log /*TODO*/}
                />
            </div>
        );
    }
}

class ScrollingTranscript extends Component {
    scrollToBottom() {
        this.bottom_placeholder.scrollIntoView({behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    renderTextWords() {
        return this.props.words.map(
            (word, idx) => 
            <div className="audio-typed-word" key={idx}>{word}</div>);
    }

    render() {
        return (
            <div className="audio-typed">
                {this.renderTextWords()}
                <div 
                    className="audio-typed-dummy" 
                    ref={(el) => {this.bottom_placeholder = el;}}
                />
            </div>
        );
    }
}

// Wrapper for React Sound
// Doesn't always update - fixes replaying bug when typing
/*
class SoundWrapper extends Sound {
    shouldComponentUpdate(nextProps, nextState) {
        console.log(nextProps);
        if(this.props.url !== nextProps.url ||
            this.props.playFromPosition !== nextProps.playFromPosition ||
            this.props.playStatus !== nextProps.playStatus
        )
            return true;
        else
            return false;
    }
}
*/

// Component for the audio task
export class AudioTaskView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
            sound_update_interval: setInterval(
                this.updateAudio.bind(this),
                250,
            ),
            sound: null,
            finished_sound: false,
        };
    }

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

    handleTextInput(event) {
        let new_text = event.target.value;

        if(new_text.endsWith(" ")) {
            let typed_word = new_text.slice(0, -1);

            Meteor.call(
                'audioInstances.submitWord', 
                this.props.audio_instance._id,
                this.props.player_num,
                typed_word
            );

            // Empty the text box again
            new_text = "";
        }

        this.setState({text: new_text});
    }

    renderAudioPlaybackBar() {
        let end_s = this.props.audio_task.time_s[AudioInstanceStates.TASK];
        let time_s = end_s - this.props.time_left;
        if(this.props.show_countdown) {
            time_s = 0;
        }
        let time_percent = time_s / end_s * 100 + "%";

        return (
            <div className="audio-view">
                <div className="audio-playback"> 
                    <div className="audio-playback-filled" style={{width: time_percent}}/>
                </div>
                <div className="audio-view-bottom">
                    <div className="audio-view-time">
                        {secondsToString(time_s)}   
                    </div>
                    <div className="audio-view-end">
                        {secondsToString(end_s)}
                    </div>
                </div>
            </div>
        );
    }

    renderTextEntry() {
        let word_lists = this.props.audio_instance.words;
        let word_list = word_lists[this.props.player_num];

        return (
            <div className="audio-text">
                <ScrollingTranscript words={word_list} />
                <input 
                    autoFocus
                    type="text" 
                    className="audio-input" 
                    value={this.state.text}
                    placeholder="Type here"
                    onInput={this.handleTextInput.bind(this)} 
                />
            </div>
        );
    }

    renderTeamStatus() {
        let player_divs = this.props.audio_instance.words.map((word_list, idx) => {
            return (
                <div className="audio-status-line" key={idx}>
                    {"Player " + (idx+1) + ": " + word_list.length}
                </div>
            );
        });
        return (
            <div className="audio-status">
                <div className="task-header">Words typed:</div>
                {player_divs}
            </div>
        );
    }

    render() {
        let header_text = "";
        let sound_status = null;
        if(this.props.show_countdown) {
            header_text = "Audio starting in " + (this.props.time_left) + "...";
        }
        else {
            header_text = "Audio playing...";
        }

        //this.updateAudio();

        return (
            <div className="task-container">
        {/*
                <SoundWrapper
                    url={'/' + this.props.audio_task.audio_path}
                    playFromPosition={this.state.start_position * 1000}
                    playStatus={sound_status}
                    autoLoad={true}
                    onFinishedPlaying={this.handleAudioFinished.bind(this)}
                />
        */}
                <div className="task-header">{header_text}</div>
                {this.renderAudioPlaybackBar()}
                {this.renderTextEntry()}
                {this.renderTeamStatus()}
                <div>
                <br/>
                Audio not playing? <br/>
                <button style={{padding: 5}} onClick={this.restartAudio.bind(this)}>
                    Restart Audio
                </button>
                </div>
            </div>
        );
    }
}


// Wrapper to handle stages and timers
export class AudioTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            seconds_left: this.props.audio_task.time_s[0],
            update_interval: setInterval(
                this.updateTimer.bind(this),
                250,
            ),
        };
    }

    componentWillUnmount() {
        if(this.state.update_interval) {
            clearInterval(this.state.update_interval);
        }
    }

    // TODO: pass this into the score screen
    handleSubmit(ratings) {
        console.log(this.props);
        Meteor.call(            
            'audioInstances.submitRating',
            this.props.audio_instance._id,
            this.props.player_num,
            ratings
        );
    }

    updateTimer() {
        let stage_num = this.props.audio_instance.state;
        let time_started = this.props.audio_instance.time_started[stage_num]
        if(!time_started)
               return;

        let time_elapsed = getSecondsSince(time_started);
        let time_left = Math.floor(this.props.audio_task.time_s[stage_num] - time_elapsed);
        if(time_left < 0)
            time_left = 0;
        
        this.setState({seconds_left: time_left});
    }

    getTimeLeftStage() {
        let stage_num = this.props.audio_instance.state;
        let stage_len_s = this.props.audio_task.time_s[stage_num];
        let time_started = this.props.audio_instance.time_started[stage_num];

        if(!time_started)
            return stage_len_s;

        let time_now = new Date();
        let diff_s = Math.abs(time_now - time_started) / 1000;

        if(diff_s > stage_len_s)
            return 0;
        else
            return stage_len_s - diff_s
    }

    renderAudioScreen(seconds_left) {
        let stage_num = this.props.audio_instance.state;
        //let seconds_left = Math.floor(this.getTimeLeftStage());
        let counting_down = (stage_num === AudioInstanceStates.WAITING)

        return (
            <AudioTaskView
                audio_task={this.props.audio_task}
                audio_instance={this.props.audio_instance}
                player_num={this.props.player_num}
                time_left={seconds_left}
                show_countdown={counting_down}
            />
        )
    }

    renderScoreScreen(seconds_left) {
        return (
            <AudioTaskScoreScreen
                audio_task={this.props.audio_task} 
                audio_instance={this.props.audio_instance}
                player_num={this.props.player_num}
                time_left={seconds_left}
            />
        );
    }

    render() {
        let stage_num = this.props.audio_instance.state;
        let seconds_left = this.state.seconds_left;
        let render_output = null;

        switch(stage_num) {
            case AudioInstanceStates.WAITING:
            case AudioInstanceStates.TASK:
                render_output = this.renderAudioScreen(seconds_left);
                break;

            case AudioInstanceStates.SCORE:
                render_output = this.renderScoreScreen(seconds_left); 
                break;
        }

        return (
            <div id="task-hide-overflow">
            <div id="task-outer">
            <div id="task-inner">
            {/* Hack to center the game*/}

            {render_output}

            </div>
            </div>
            </div>
        );            
    }
}