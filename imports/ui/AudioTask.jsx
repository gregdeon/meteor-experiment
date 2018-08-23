import React, { Component } from 'react';

import {AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString, centsToString} from '../api/utils.js';
import {soundManager} from 'soundmanager2'

export class ScrollingTranscript extends Component {
    scrollToBottom() {
        this.bottom_placeholder.scrollIntoView({behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        return (
            <div className="audio-typed">
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
        let time_percent = this.props.time_elapsed / this.props.total_time * 100 + "%";
        return <div className="audio-view">
            <div className="audio-playback"> 
                <div className="audio-playback-filled" style={{width: time_percent}}/>
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
            /* TODO: handle this properly
            Meteor.call(
                'audioInstances.submitWord', 
                this.props.audio_instance._id,
                this.props.player_num,
                typed_word
            );
            */

            // Empty the text box again
            new_text = "";
        }

        this.setState({text: new_text});
    }

    render() {
        return <input 
            autoFocus
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
    constructor(props) {
        super(props);

        this.state = {
            text: "",
        };
    }

    renderAudioPlaybackBar() {
        /* TODO: get time left from audio task */
        /*
        let end_s = this.props.audio_task.time_s[AudioInstanceStates.TASK];
        let time_s = end_s - this.props.time_left;
        if(this.props.show_countdown) {
            time_s = 0;
        }
        let time_percent = time_s / end_s * 100 + "%";
        */
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
                <AudioTaskInput
                    onTypedWord={console.log /*TODO: submit word*/}
                />
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