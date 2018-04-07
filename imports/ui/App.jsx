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

import QueryString from 'query-string';

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
            </div>
        );
    }
}

class App extends Component {
    logInOrCreateAccount(worker_id) {
        // Don't bother with passwords here
        // We're just tracking usernames
        let fixed_password = "12067124892601";

        // Try to log in
        Meteor.loginWithPassword(worker_id, fixed_password, (err) => {
            if(err) {
                if(err.reason === "User not found") {
                    // Try to create account
                    Accounts.createUser({
                        username: worker_id,
                        password: fixed_password,
                    }, (err) => {
                        if(err) {
                            console.log('Error while creating new user: ' + err.reason)
                        }
                    }); 
                }
                else {
                    console.log('Login failed: ' + err.reason);
                }
            }
        });
    }

    checkRepeat(assign_id) {
        workflow_instance = this.props.workflowInstance;
        if(!workflow_instance) {
            return false;
        }

        return (assign_id !== workflow_instance.assign_id);
    }

    render() {
        // Get URL params from router
        let query_params = this.props.location.search;
        let parsed = QueryString.parse(query_params)
        console.log(parsed);

        let assign_id = parsed.assignment;
        let worker_id = parsed.worker;

        console.log(assign_id)
        console.log(worker_id)

        // Wait for db connections
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        // Log out if the username doesn't match
        let user = this.props.user
        if(user && worker_id !== user.username) {
            Meteor.logout();
        }

        // If not logged in, automatically log in with worker ID
        if(!this.props.user) {
            this.logInOrCreateAccount(worker_id);
            return (<div>Loading...</div>);
        }

        // Check for repeat users
        if(this.checkRepeat(assign_id))
            return (<StopRepeat />);


        // Removed for now: manual login
        // Log in if not logged in
//        if(!this.props.user) {
//            return (<LoginForm />);
//        }

        // Debug
        let debug = false;
        if(debug) {   
            return (
                <div>
                    <WordSearchPuzzle 
                        puzzle={this.props.puzzle}
                        puzzleinstance={this.props.puzzleInstance}
                    />
                </div>
            );
        }

        // Show their workflow
        return (
            <Workflow
                workflowInstance={this.props.workflowInstance}
                coopInstance={this.props.coopInstance}
                assign_id={assign_id}
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
