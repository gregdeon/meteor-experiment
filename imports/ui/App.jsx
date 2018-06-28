// App.jsx
// Main app view
import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

// API requirements
import {WorkflowInstances} from '../api/workflowInstances.js';
import {CoopWorkflowInstances} from '../api/coopWorkflowInstances.js';
import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {AudioTasks} from '../api/audioTasks.js';
import {AudioInstances} from '../api/audioInstances.js';
import {BlockedUsers} from '../api/blockedUsers.js';

// UI
import {Workflow} from './Workflow.jsx';
import {LoginForm} from './LoginForm.jsx';
import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';

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
        // Wait for db connections
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        // If not logged in, automatically log in with worker ID
        if(!this.props.user) {
            return <LoginForm />;
        }

        // Check for repeat users
        let blocked_num = BlockedUsers.find({username: this.props.user.username}).count();
        if(blocked_num > 0) {   
            return (<StopRepeat />);
        }
     
        // Show their workflow
        return (
            <Workflow
                workflowInstance={this.props.workflowInstance}
                coopInstance={this.props.coopInstance}
                history={this.props.history}
            />
        );
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('workflows'),
        Meteor.subscribe('workflowinstances'),
        Meteor.subscribe('coopworkflows'),
        Meteor.subscribe('coopworkflowinstances'),
        Meteor.subscribe('consentforms'),
        Meteor.subscribe('surveys'),
        Meteor.subscribe('surveyinstances'),
        Meteor.subscribe('feedbackletters'),
        Meteor.subscribe('tutorials'),
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
        Meteor.subscribe('audiotasks'),
        Meteor.subscribe('audioinstances'),
        Meteor.subscribe('servertime'),
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
        user: Meteor.user(),

        // TODO: handle cases where user has joined more than one workflow
        // For now, assume there's only one

        // Note that these may be undefined - it's up to the app to
        // deal with these cases
        workflowInstance: WorkflowInstances.findOne(),
        coopInstance: CoopWorkflowInstances.findOne(),

        // TODO: this is a total hack
        // Force re-renders whenever anything gets changed in these
        puzzle_instances: PuzzleInstances.find().fetch(),
        audio_instances: AudioInstances.find().fetch(),

        // TODO: remove these when done debugging
        //puzzle: Puzzles.findOne(),
        //puzzleInstance: PuzzleInstances.findOne();
    };
})(App);
