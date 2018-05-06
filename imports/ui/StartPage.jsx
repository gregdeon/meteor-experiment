// App.jsx
// Main app view
import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

// API requirements
import {WorkflowInstances} from '../api/workflowInstances.js';

// UI
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
            </div>
        );
    }
}

class StartPage extends Component {
    setUpWorkflow() {
        // Make a workflow
        Meteor.call(
            'workflowinstances.setUpWorkflow',
            Meteor.user()._id,
        )

        // Redirect to the main experiment page
        this.props.history.push('/');
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

        // If we're logged in, see if we have a workflow
        if(this.props.workflow_instance) {
            // We already do - this is bad!
            // They're trying to restart the experiment, so stop them
            return <StopRepeat />;
        }
        
        // Everything is good - set up the workflow for them
        this.setUpWorkflow()
           

        // Show their workflow
        return (
            <div>Setting up the experiment for you...</div>
        );
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('workflows'),
        Meteor.subscribe('workflowinstances'),
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
        workflow_instance: WorkflowInstances.findOne(),

    };
})(StartPage);
