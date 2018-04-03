import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {CoopWorkflows, CoopWorkflowStages} from '../api/coopWorkflows.js';
import Notify from 'notifyjs';

// Left-pad a number with 0s
function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
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

            tab_title: document.title,
            alert_num_toggles: 0,
            alert_interval: null,
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

    toggleTitle() {
        console.log(this.state);
        let toggles_left = this.state.alert_num_toggles - 1;

        if(toggles_left % 2 === 1) {
            document.title = "Ready to start!";
        } else {
            document.title = this.state.tab_title;
        }

        if(toggles_left <= 0) {
            this.endAlert();
        }
        this.setState({alert_num_toggles: toggles_left});
    }

    // Note: only call this with an even number of toggles
    startAlert(num_toggles) {
        var notification = new Notify('Team ready!', {
            body: 'Your task is starting in a few seconds.',
        });

        if (Notify.isSupported()) {
            if (Notify.needsPermission) {
                Notify.requestPermission();
            } else {
                notification.show();
            }
        }

        this.setState({
            alert_num_toggles: num_toggles
        });

        if(this.state.alert_interval) {
           this.endAlert();
        }

        let id = setInterval(
            this.toggleTitle.bind(this),
            500,
        );

        this.setState({
            alert_interval: id,
        });
    }

    endAlert() {
        clearInterval(this.state.alert_interval);
    }

    render() {   
        return (
            <div className="lobby-container">
                <h1>Pre-Task Lobby</h1>
                <p>Before you begin the task, we need to find a team for you.</p>
                <p>We'll send you an alert when your team is ready.</p>
                <p>You can click `Test Alert' to confirm that this works.</p>
                <div id="lobby-loader" />
                <p>Waiting for teammates...</p>
                <p>Time in queue: {this.getQueueTimeString()}</p>
                <div className="lobby-button" >
                    <button 
                        onClick={this.startAlert.bind(this, 6)}
                    >
                        Test Alert
                    </button>
                </div>
            </div>
        );
    }

    componentWillUnmount() {
        if(this.state.alert_interval) {
            clearInterval(this.state.alert_interval);
        }

        clearInterval(this.state.queue_update);
    }
}

export class CoopWorkflow extends Component {
    advanceCoopStage() {
        console.log("TODO");
    }

    render() {
        console.log(this.props);

        // Get a workflow if we don't have one
        if(!this.props.coop_instance) {
            Meteor.call(
                'coopworkflowinstances.setUpWorkflow',
                Meteor.userId(),
            )

            return (<div>Setting things up for you...</div>);
        }

        let coop_workflow = CoopWorkflows.findOne(
            {_id: this.props.coop_instance.coop_id}
        );

        let stage_num = this.props.coop_instance.stage;
        let stages = coop_workflow.stages;
        let stage = stages[stage_num];

        switch(stage.type) {
            case CoopWorkflowStages.LOBBY:
                return (
                    <LobbyScreen 
                        finishedCallback={this.advanceCoopStage.bind(this)}
                    />
                );

            case CoopWorkflowStages.PUZZLE:
                return (
                    <div>TODO</div>
                );
        }
    }
}