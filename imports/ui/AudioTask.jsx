import React, { Component } from 'react';
//import Sound from 'react-sound';

import {RewardDisplay, RewardForm} from './RewardForm.jsx';
import {AudioInstanceStates, getInstanceResults} from '../api/audioInstances.js';
import {getSecondsSince, secondsToString, centsToString} from '../api/utils.js';
import {soundManager} from 'soundmanager2'

export class AudioTaskScore extends Component {
    handleSubmit(ratings) {
        console.log(this.props);
        Meteor.call(            
            'audioInstances.submitRating',
            this.props.audio_instance._id,
            this.props.player_num,
            ratings
        );
    }

    renderPlayerMarkers(num_players) {
        let player_divs = []
        for(let i = 0; i < num_players; i++) {
            player_divs.push(
                <div className="audio-transcript-player"
                    key={i}
                >
                    Player {i+1}
                </div>
            );
        }

        return (
            <div className="audio-transcript-players">
                <div className="audio-transcript-blank" />
                {player_divs}
            </div>

        );
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
        let word_list = this.props.audio_instance.words[player_num]
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

/*
        let word_divs = word_list.map((word, idx) => {
            if(words_correct[idx]) {
                return (
                    <div className={"audio-transcript-text-p" + (player_num+1)} key={idx}>
                        {word}
                    </div>
                );
            }
            else {
                return (
                    <div className="audio-transcript-text-wrong" key={idx}>
                        {word}
                    </div>
                );
            }
        })
*/

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
                <div className="audio-transcript-legend">
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

    renderPlotItem(player_num, value, max_value) {
        let percent = value / max_value
        return (
            <div 
                className={"audio-statistics-p" +(player_num + 1)} 
                style={{width: 100*percent + "%"}}
            >
                {value}
            </div>
        );
    }

    renderWordsPlot(player_num, percent_correct, percent_errors) {
        return (
            <div className="audio-statistics-plot">
                <div 
                    className={"audio-statistics-p" + (player_num + 1)} 
                    style={{width: 100*percent_correct + "%"}}
                />
                <div 
                    className={"audio-statistics-errors"} 
                    style={{
                        width: 100*percent_errors + "%",
                        left: 100*percent_correct + "%"
                    }}
                />
            </div>
        );
    }

    renderStatistics(results, player_num) {
        let results_rows = [];
        let max_typed = results.anybody_found.length;

        if(max_typed == 0) {
            max_typed = 1;
        }
        // TODO: fix this to look for the max
        max_typed = 59;

        for(let i = 0; i < results.typed.length; i++) {
            let num_typed = results.typed[i].length;
            let num_correct = results.typed[i].filter(v => v).length;
            let num_errors = num_typed - num_correct;

            //let percent_correct = num_correct / max_typed;
            //let percent_errors = num_errors / max_typed;
            let typed_plot = this.renderPlotItem(i, num_typed, max_typed);
            let correct_plot = this.renderPlotItem(i, num_correct, max_typed);

            //let plot_div = this.renderWordsPlot(i, percent_correct, percent_errors);

            let player_string = "Player " + (i+1);
            if(player_num === i) {
                player_string += " (you)";
            }

            results_rows.push(
                <tr key={i}>
                    <td>{player_string}</td>
                    <td>{num_typed}</td>
                    <td>
                        <div className="audio-statistics-plot">{typed_plot}</div>
                    </td>
                    <td>{num_correct}</td>
                    <td>
                        <div className="audio-statistics-plot">{correct_plot}</div>
                    </td>
                    <td>{num_errors}</td>
                    {/* 
                    <td>{plot_div}</td>
                    */}
                </tr>
            );
        }

        return (
            <table className="audio-statistics"><tbody>
                <tr key={-1}>
                    <th>Player</th>
                    <th>Typed</th><th/>
                    <th>Correct</th><th/>
                    <th>Errors</th>
                </tr>
                {results_rows}
            </tbody></table>
        );
    }

    renderRewards(rewards) {
        let ratings = this.props.audio_instance.ratings;

        let total = rewards[3];
        //for(let i = 0; i < rewards.length; i++)
        //    total += rewards[i];

        return (
            <div>
                <p>Individual payments: </p>
                <RewardDisplay
                    rewards={rewards.slice(0, 3)}
                />
                <div className="task-header">Questions</div>
                <RewardForm 
                    submit_callback={this.handleSubmit.bind(this)}
                />
                <p>The next task will start in {this.props.time_left} seconds or as soon as all players submit their ratings.</p>
                {ratings.map((rating, idx) => {
                    return (
                        <div className="score-screen-submitted" key={idx}>Player {idx+1}: {rating !== null ? "✔" : "✖"}</div>
                    );
                })}
            </div>
        );
    }

    render() {
        let results = getInstanceResults(this.props.audio_instance);
        let num_found = results.anybody_found.filter(v => v).length;
        let total_pay = results.payments[3];
        return (
            <div className="task-container">
                <div className="task-header">Audio clip finished!</div>
                {this.renderAllTranscripts(results, this.props.player_num)}
                {/*
                <p>You typed:</p>
                {this.renderTranscript(results, this.props.player_num)}
                <div className="task-header">Team statistics:</div>
                {this.renderStatistics(results, this.props.player_num)}
                */}
                <p>Your team earned <b>{centsToString(total_pay)}</b> for typing <b>{num_found}</b> correct words (5c per 10 words).</p>
                {this.renderRewards(results.payments)}
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
            sound: null,
            finished_sound: false,
        };
    }

    componentWillUnmount() {
        this.removeSound();
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
        let time_stage = this.props.audio_task.time_s[AudioInstanceStates.TASK];
        let time_elapsed = time_stage - this.props.time_left;
        if(this.state.sound) {
            this.state.sound.stop();
            this.state.sound.setPosition(time_elapsed * 1000)
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

        this.updateAudio();

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