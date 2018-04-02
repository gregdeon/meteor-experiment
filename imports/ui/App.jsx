// App.jsx
// Main app view
import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

// API requirements
import {Workflows} from '../api/workflows.js';
import {WorkflowInstances} from '../api/workflowInstances.js';
import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';

// UI
import {Workflow} from './Workflow.jsx';
import {LoginForm} from './LoginForm.jsx';

class App extends Component {
    render() {
        // Wait for db connections
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        // Log in if not logged in
        if(!this.props.user) {
            return (<LoginForm />);
        }

        // Show their workflow
        return (
            <Workflow
                workflow={this.props.workflow}
                workflowInstance={this.props.workflowInstance}
            />
        );

/*
        return (
            <div>
                {(draw_consent ? <ConsentForm /> : '')}
                <WordSearchPuzzle 
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                />
            </div>

        );
*/
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('workflows'),
        Meteor.subscribe('workflowinstances'),
        Meteor.subscribe('consentforms'),
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
    ];

    // Check if ready by putting together subscriptions
    let all_ready = true;
    sub.map((sub_item) => {
        if(!sub_item.ready())
            all_ready = false;
    });

    return {
        ready: all_ready,
        user: Meteor.user(),
        // TODO: find this user's workflow and instance
        // For now, assume there's only one
        workflow: Workflows.findOne(),
        workflowInstance: WorkflowInstances.findOne(),
        puzzle: Puzzles.findOne(),
        puzzleInstance: PuzzleInstances.findOne(),
    };
})(App);
