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

// UI
import {Workflow} from './Workflow.jsx';
import {LoginForm} from './LoginForm.jsx';
import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';

class App extends Component {
    checkRepeat(assign_id) {
        workflow_instance = this.props.workflowInstance;
        if(!workflow_instance) {
            return false;
        }

        return (assign_id !== workflow_instance.assign_id);
    }

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
        //if(this.checkRepeat(assign_id))
        //    return (<StopRepeat />);

        // Show their workflow
        return (
            <Workflow
                workflowInstance={this.props.workflowInstance}
                coopInstance={this.props.coopInstance}
                //assign_id={assign_id}
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
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
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
        // Force re-renders whenever a word gets found
        puzzle_instances: PuzzleInstances.find().fetch(),

        // TODO: remove these when done debugging
        //puzzle: Puzzles.findOne(),
        //puzzleInstance: PuzzleInstances.findOne(),
    };
})(App);
