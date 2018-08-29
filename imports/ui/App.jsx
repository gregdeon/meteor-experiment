// App.jsx
// Main app view
import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';
import * as qs from 'query-string';

// API requirements
import {WorkflowInstances} from '../api/workflowInstances.js';
import {AudioTasks} from '../api/audioTasks.js';
import {BlockedUsers} from '../api/blockedUsers.js';

// UI
import WorkflowContainer from './Workflow.jsx';
import {LoginForm} from './LoginForm.jsx';


class StopRepeat extends Component {
    render() {
        return (
            <div className="sorry-container">
                <h1>Experiment Already Completed</h1>
                <hr />
                <p>Our records show that you have already completed this HIT.</p>
                <p>In order for our experiment results to be valid, we cannot allow workers to complete this task multiple times.</p>
                <p>Please return this HIT.</p>
                <p>We're sorry for any inconvenience.</p>
                <p>If you have any questions, please feel free to contact me at greg.deon@uwaterloo.ca.</p>
            </div>
        );
    }
}

class App extends Component {
    render() {
        console.log(this.props);
        // Wait for db connections
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        // Check for repeat users
        let blocked_num = BlockedUsers.find({username: this.props.worker_id}).count();
        if(blocked_num > 0) {   
            return (<StopRepeat />);
        }
     
        // Show their workflow
        return (
            <WorkflowContainer
                workflow_instance={this.props.workflow_instance}
                worker_id={this.props.worker_id}
                assignment_id={this.props.assignment_id}
                hit_id={this.props.hit_id}
            />
        );
    }
}

export default withTracker((props) => {
    // Get MTurk details from URL params
    let url_param_string = props.location.search;
    let split_params = qs.parse(url_param_string, {ignoreQueryPrefix: true});

    let worker_id = split_params.WORKER_ID || "greg";
    let assignment_id = split_params.ASSSIGNMENT_ID || "no_assignment";
    let hit_id = split_params.HIT_ID || "no_hit";

    const sub = [
        Meteor.subscribe('workflows'),
        Meteor.subscribe('workflowinstances.worker_id', worker_id),
        Meteor.subscribe('consentforms'),
        Meteor.subscribe('surveys'),
        Meteor.subscribe('surveyinstances'),
        Meteor.subscribe('feedbackletters'),
        Meteor.subscribe('tutorials'),

        // Don't subscribe to audio instances here - do that in the workflow container
        // Meteor.subscribe('audiotasks'),
        //Meteor.subscribe('audioinstances'),

        // TODO: remove this and replace with MTurk qualifications?
        Meteor.subscribe('blockedusers'),
    ];

    // Check if ready by putting together subscriptions
    let all_ready = true;
    sub.map((sub_item, idx) => {
        if(!sub_item.ready())
        {
            all_ready = false;
        }
    });


    return {
        ready: all_ready,
        // user: Meteor.user(),
        worker_id: worker_id,
        assignment_id: assignment_id,
        hit_id: hit_id,
    };
})(App);
