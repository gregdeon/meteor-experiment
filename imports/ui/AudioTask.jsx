import React, { Component } from 'react';
import Sound from 'react-sound';

import {AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString} from '../api/utils.js';

// TODO: this is a test for now
export class AudioTaskScore extends Component {
    renderPlayerMarkers(num_players) {
        let player_divs = []
        for(let i = 0; i < num_players; i++) {
            player_divs.push(
                <div className="audio-transcript-player">Player {i+1}</div>
            );
        }

        return (
            <div className="audio-transcript-players">
                <div className="audio-transcript-blank" />
                {player_divs}
            </div>

        );
    }

    renderWord(word, found_list) {
        let found_divs = found_list.map((word, idx) => {
            let style = {visibility: found_list[idx] ? "visible" : "hidden"}

            return (
                <div 
                    className={"audio-transcript-p" + (idx+1)} 
                    style={style}
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
            <div className="audio-transcript-word">
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

    renderTranscript(found_lists) {
        let word_list = this.props.audio_task.words;
        let results = getInstanceResults(this.props.audio_instance);
        console.log(this.props.audio_instance);
        console.log(results);

        let anybody_found_word = results.found.map(found_list => {
            for(let i = 0; i < found_list.length; i++){
                if(found_list[i])
                    return true;
            }
            return false;
        });

        let word_divs = word_list.map((word, idx) => {
            if(idx > 0 && !anybody_found_word[idx] && !anybody_found_word[idx-1])
                return null;
            else 
                return this.renderWord(word, results.found[idx]);
        });

        return (
            <div className="audio-transcript">
                {this.renderPlayerMarkers(results.typed.length)}
                {word_divs}
            </div>
        );
    }

    renderStatistics() {

    }

    render() {
        return (
            <div className="task-container">
                <div className="task-header">Audio clip finished!</div>
                <div className="task-header">Final transcript:</div>
                {this.renderTranscript()}
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

// Component for the audio task
export class AudioTaskView extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: "",
        };
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
            header_text = "Audio starting in " + (this.props.seconds_left) + "...";
            sound_status = Sound.status.STOPPED;
        }
        else {
            header_text = "Audio playing...";
            sound_status = Sound.status.PLAYING;
        }

        return (
            <div className="task-container">
                <Sound 
                    url={'/' + this.props.audio_task.audio_path}
                    playStatus={sound_status}
                />
                <div className="task-header">{header_text}</div>
                {this.renderAudioPlaybackBar()}
                {this.renderTextEntry()}
                {this.renderTeamStatus()}
            </div>
        );
    }
}


// Wrapper to handle stages and timers
export class AudioTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            update_interval: setInterval(
                this.updateTimer.bind(this),
                250,
            ),
        };
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
        
        let new_time_left = this.state.time_left.slice();
        new_time_left[stage_num] = time_left;

        this.setState({time_left: new_time_left});
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

    renderAudioScreen() {
        let stage_num = this.props.audio_instance.state;
        let seconds_left = Math.floor(this.getTimeLeftStage());
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

    renderScoreScreen() {
        return (
            <AudioTaskScore
                audio_task={this.props.audio_task} 
                audio_instance={this.props.audio_instance}
                player_num={this.props.player_num}
                time_left={seconds_left}
            />
        );
    }

    render() {
        let stage_num = this.props.audio_instance.state;
        let render_output = null;

        switch(stage_num) {
            case AudioInstanceStates.WAITING:
            case AudioInstanceStates.TASK:
                render_output = this.renderAudioScreen();
                break;

            case AudioInstanceStates.SCORE:
                render_output = this.renderScoreScreen(); 
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