import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {CoopWorkflows, CoopWorkflowStages} from '../api/coopWorkflows.js';
import {isFull, initializeOutput} from '../api/routing.js';

import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';

import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';

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
            queue_start: new Date().getTime(),
            queue_ms: 0,
            queue_update: setInterval(
                this.updateQueueTime.bind(this),
                500,
            ),
        };
    }

    updateQueueTime() {
        let time_now = new Date().getTime();
        let queue_ms = time_now - this.state.queue_start;
        this.setState({queue_ms: queue_ms});
    }

    getQueueTimeString() {
        var time_s = Math.floor(this.state.queue_ms / 1000);
        var mins = Math.floor(time_s / 60);
        var secs = time_s % 60;

        var queue_string = "" + mins + ":" + pad(secs, 2);
        return queue_string;
    }

    playAlert() {
        flashTitle("Ready to start!", 6, 500);
        // TODO: audio?
//        let audio = new Audio('https://localhost:3000/rooster.wav');
//        audio.play();
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
        //this.props.coop_instance.user_ids;

        return (
            <div className="lobby-status">
                {status_items}
            </div>
        );
    }

    render() {   
        // If our group is full, move on
        if(isFull(this.props.coop_instance)) {
            this.playAlert();
            this.props.finishedCallback();
        }

        return (
            <div className="lobby-container">
                <h1>Pre-Task Lobby</h1>
                <p>Before you begin the task, we need to find a team for you.</p>
                <p>Waiting for teammates...</p>
                {this.renderStatus()}
                <div id="lobby-loader" />
                <p>Time in queue: {this.getQueueTimeString()}</p>
                {/*
                */}
                <span id="audio"></span>
                <button onClick={this.playAlert.bind(this)}>
                    Test
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
    }
}

export class CoopWorkflow extends Component {
    advanceCoopStage(current_stage) {
        console.log(this.props.coop_instance);
        Meteor.call(
            'coopworkflowinstances.advanceStage',
            this.props.coop_instance._id,
            current_stage,
        );
    }

    render() {
        console.log(this.props);

        // Get a workflow if we don't have one
        if(!this.props.coop_instance) {
            Meteor.call(
                'coopworkflowinstances.setUpWorkflow',
            )

            return (<div>Setting things up for you...</div>);
        }

        if(!this.props.coop_instance.ready) {
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
        if(stage_num >= stages.length) {
            this.props.finishedCallback();
            return null;
        }
        else {
            switch(stage.type) {
                case CoopWorkflowStages.LOBBY:
                    return (
                        <LobbyScreen 
                            coop_instance={this.props.coop_instance}
                            finishedCallback={this.advanceCoopStage.bind(this, stage_num)}
                        />
                    );

                case CoopWorkflowStages.PUZZLE:
                    let puzzle_instance = PuzzleInstances.findOne({_id: output_id})
                    let puzzle = Puzzles.findOne({_id: puzzle_instance.puzzle})
                    let player_num = this.props.coop_instance.user_ids.indexOf(Meteor.userId())
                    return (
                        <WordSearchPuzzle
                            puzzle={puzzle}
                            puzzleinstance={puzzle_instance}
                            player_num={player_num}
                            puzzle_num={stage_num - 1}
                            finishedCallback={this.advanceCoopStage.bind(this, stage_num)}
                        />
                    );
                    // TODO: puzzle_num assumes 1 lobby at start
            }
        }
    }
}