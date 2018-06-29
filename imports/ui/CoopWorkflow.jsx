import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {CoopWorkflows, CoopWorkflowStages} from '../api/coopWorkflows.js';
import {CoopReadyStates} from '../api/routing.js';

import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {AudioTasks} from '../api/audioTasks.js';
import {AudioInstances} from '../api/audioInstances.js';

import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';
import {AudioTask} from './AudioTask.jsx';

import {getServerTime, secondsToString} from '../api/utils.js';

// Left-pad a number with 0s
function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
}

function flashTitle(new_title, num_toggles, length_s) {
    let old_title = document.title;
    document.title = new_title;

    if(num_toggles - 1 > 0) {
        setTimeout(
            function(){
                flashTitle(old_title, num_toggles - 1, length_s)
            },
            length_s
        );
    }
}

class LobbyScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            queue_left_s: this.props.coop_workflow.lobby_time * 60,
            queue_update: setInterval(
                this.updateQueueTime.bind(this),
                500,
            ),
        };
    }

    updateQueueTime() {
        let time_now = new Date(getServerTime()).getTime();
        let time_start = this.props.coop_instance.time_started;

        let elapsed_s = Math.floor((time_now - time_start) / 1000);
        let new_left_s = this.props.coop_workflow.lobby_time * 60 - elapsed_s;

        if(new_left_s < 0)
            new_left_s = 0;

        this.setState({queue_left_s: new_left_s});
    }

    getQueueTimeString() {
        return secondsToString(this.state.queue_left_s);
    }

    playAlert() {
        flashTitle("Ready to start!", 10, 500);

        console.log("Playing audio");
        $('#audio').html('<audio autoplay><source src="/rooster.wav"></audio>');
    }

    renderStatus() {
        let status_items = [];
        let user_ids = this.props.coop_instance.user_ids;
        for(let i = 0; i < 3; i++) {
            let ready_string = "";
            if(user_ids.length > i) {
                ready_string = "Ready";
                if(user_ids[i] === Meteor.userId()) {
                    ready_string += " (you)";
                }
            } else {
                ready_string = "Not Ready";
            }

            status_items.push(
                <p key={i}><b>Player {i+1}</b>: {ready_string}</p>
            );
        }

        return (
            <div className="lobby-status">
                {status_items}
            </div>
        );
    }

    render() {   
        let coop_workflow = CoopWorkflows.findOne({_id: this.props.coop_instance.coop_id});
        let wait_mins = coop_workflow.lobby_time;

        return (
            <div className="lobby-container">
                <h1>Pre-Task Lobby</h1>
                <p> 
                    Before you begin, we need to find you a team.
                </p>
                <p>
                    When your team is ready, we will notify you with a <b>rooster sound</b> and by flashing the <b>tab title.</b> Please keep this tab open, but feel free to switch to other tabs while you are waiting.
                </p>
                <p>
                    If the task doesn't start within {wait_mins} minutes, you will still be paid for your time - we will skip straight to the confirmation code.
                </p>

                <div id="lobby-loader" />
                <p>Waiting for teammates...</p>
                {this.renderStatus()}
                <p>Time left in queue: {this.getQueueTimeString()}</p>
                {/*
                */}
                <button onClick={this.playAlert.bind(this)}>
                    Test Alert
                </button>

            {/* 
                <p>We'll send you an alert when your team is ready.</p>
                <p>You can click `Test Alert' to confirm that this works.</p>
                <div className="lobby-button" >
                    <button 
                        onClick={this.startAlert.bind(this, 6)}
                    >
                        Test Alert
                    </button>
                </div>
            */}
            </div>
        );
    }

    componentWillUnmount() {
        clearInterval(this.state.queue_update);

        // We're tearing down, so play the alert now
        this.playAlert();
    }
}

export class CoopWorkflow extends Component {
    // Helper function: lobby alerts need to be here

    render() {
        console.log(this.props);

        // Get a workflow if we don't have one
        if(!this.props.coop_instance) {
            Meteor.call(
                'coopworkflowinstances.setUpWorkflow',
            )

            return (<div>Setting things up for you...</div>);
        }

        if(this.props.coop_instance.ready_state !== CoopReadyStates.READY) {
            return (<div>Setting things up for you...</div>);
        }

        let coop_workflow = CoopWorkflows.findOne(
            {_id: this.props.coop_instance.coop_id}
        );

        let stage_num = this.props.coop_instance.stage;
        let stages = coop_workflow.stages;
        let stage = stages[stage_num];
        let output_id = this.props.coop_instance.output[stage_num];

        // Move on if we're past the end
        if(stage_num < 0) {
            this.props.lobbyFailedCallback();
            return null;
        }
        if(stage_num >= stages.length) {
            this.props.finishedCallback();
            return null;
        }
        else {
            let player_num = this.props.coop_instance.user_ids.indexOf(Meteor.userId())
            switch(stage.type) {
                case CoopWorkflowStages.LOBBY:
                    return (
                        <LobbyScreen 
                            coop_workflow={coop_workflow}
                            coop_instance={this.props.coop_instance}
                        />
                    );

                case CoopWorkflowStages.PUZZLE:
                    let puzzle_instance = PuzzleInstances.findOne({_id: output_id})
                    let puzzle = Puzzles.findOne({_id: puzzle_instance.puzzle})

                    // TODO: puzzle_num assumes 1 lobby at start
                    return (
                        <WordSearchPuzzle
                            puzzle={puzzle}
                            puzzleinstance={puzzle_instance}
                            player_num={player_num}
                        />
                    );

                case CoopWorkflowStages.AUDIO:
//                    let audio_instance = AudioInstances.findOne({})
                    let audio_instance = AudioInstances.findOne({_id: output_id});
                    let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task});

                    return (                        
                        <AudioTask
                            audio_task={audio_task}
                            audio_instance={audio_instance}
                            player_num={player_num}
                        />
                    );
            }
        }
    }
}

