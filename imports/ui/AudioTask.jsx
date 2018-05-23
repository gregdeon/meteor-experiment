import React, { Component } from 'react';
import {AudioInstanceStates} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString} from '../api/utils.js';

// TODO: this is a test for now
class AudioTaskScore extends Component {
    getWordList() {
        return [ 
            "As", "we", "think", "about", "comprehension", "and", "response", "today", "I’d", //"like", "you", "to", "first", "think", "about", "the", "essential", "comprehension", "strategies.", "And", "for", "me", "this", "is", "an", "important", "starting", "place,", "because", "one", "of", "the", "things,", "I", "think,", "that", "happens", "to", "us", "as", "teachers", "is", "that", "we", "end", "up", "with", "this", "very", "large", "collection", "of", "comprehension", "strategies.", 
        ];
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

        let word_to_render = "?";
        for(let i = 0; i < found_list.length; i++) {
            if(found_list[i]) {
                word_to_render = word;
                break;
            }
        }

        return (
            <div className="audio-transcript-word">
                <div className="audio-transcript-text">
                    {word_to_render}
                </div>
                {found_divs}
            </div>
        );
    }


    render() {
        let word_list = this.getWordList();
        let found_list = new Array(word_list.length).fill([false, false, false])

        found_list[0] = [true, true, true];
        found_list[1] = [true, true, false];
        found_list[2] = [true, false, false];
        found_list[3] = [false, true, true];
        found_list[4] = [false, false, false];
        found_list[5] = [false, true, true];
        found_list[6] = [true, true, true];
        found_list[7] = [true, true, true];

        let word_divs = word_list.map((word, idx) => {
            return this.renderWord(word, found_list[idx]);
        });

        return (
            <div className="audio-transcript">
                {word_divs}
            </div>
        );
    }
}

export class AudioTask extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time_left: this.props.audio_task.time_s.slice(),
            update_interval: setInterval(
                this.updateTimer.bind(this),
                250,
            ),
            text: "",
            // TODO: this is temporary
            test_words: [],
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

    handleTextInput(event) {
        let new_text = event.target.value;

        if(new_text.endsWith(" ")) {
            // TODO: submit word
            // Also make sure to update our match-finding data structure at the same time
            let typed_word = new_text.slice(0, -1);
            console.log(typed_word);

            let new_word_list = this.state.test_words.slice();
            new_word_list.push(typed_word);
            this.setState({test_words: new_word_list});

            new_text = "";
        }

        this.setState({text: new_text});
    }

    renderAudioPlaybackBar() {
        let end_s = this.props.audio_task.time_s[AudioInstanceStates.TASK];
        let time_s = end_s - this.state.time_left[AudioInstanceStates.TASK];
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

    renderTextWords() {
        return this.state.test_words.map(word => <div className="audio-typed-word">{word}</div>);
    }

    renderTextEntry() {
        return (
            <div className="audio-text">
                <div className="audio-typed">
                    {this.renderTextWords()}
                    <div className="audio-typed-dummy" />
                </div>
                <input 
                    type="text" 
                    className="audio-input" 
                    value={this.state.text}
                    onInput={this.handleTextInput.bind(this)} 
                />
            </div>
        );
    }

    renderAudioScreen() {
        let stage_num = this.props.audio_instance.state;
        let header_text = "";
        if(stage_num === AudioInstanceStates.WAITING) {
            let seconds_left = this.getTimeLeftStage();
            header_text = "Audio starting in " + seconds_left + "...";
        }
        else if(stage_num === AudioInstanceStates.TASK) {
            header_text = "Audio playing...";
        }

        return (
            <div className="task-container">
                <div className="task-header">{header_text}</div>
                {this.renderAudioPlaybackBar()}
                {this.renderTextEntry()}
                <br />
                <hr />
                <AudioTaskScore />
            </div>
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
                render_output = <div className="task-container">TODO: score screen</div>
        }

        return (
            <div id="task-hide-overflow">
            <div id="task-outer">
            <div id="task-inner">
            {/* Hack to center the game*/}

            {render_output}

{/*
            <div className="word-search-container-left">
                <WordSearchTime
                    time_left={this.props.time_left}
                />
                <WordSearchStatus
                    task={this.props.task}
                    taskinstance={this.props.taskinstance}
                    player_num={this.props.player_num}
                />
                <WordSearchScoreBox 
                    task={this.props.task}
                    task_instance={this.props.taskinstance}
                />
            </div>
            <div className='word-search-container-right'>
                <WordSearchGrid
                    task={this.props.task}
                    taskinstance={this.props.taskinstance}
                    player_num={this.props.player_num}
                />
            </div>
*/}

            </div>
            </div>
            </div>
        );            
    }
}