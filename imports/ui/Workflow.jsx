import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';
import {CoopWorkflow} from './CoopWorkflow.jsx';
import {TutorialScreen} from './Tutorial.jsx';
import {AudioRatingScreen} from './AudioRatingTask.jsx';

import {Workflows, WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';
import {Tutorials} from '../api/tutorials.js';
import {CoopWorkflows} from '../api/coopWorkflows.js';
import {getWorkflowProgress, getWorkflowEarnings} from '../api/workflowInstances.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {AudioInstances} from '../api/audioInstances.js';

// Left-pad a number with 0s
function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
}

class WorkflowHeader extends Component {
    renderProgress() {
        console.log(this.props);
        let progress = getWorkflowProgress(
            this.props.workflow_instance,
            this.props.coop_instance
        );

        let percent_done = progress.done / progress.total * 100;
        return (
            <div className="workflow-progress">
                Progress: 
                <div className="workflow-progress-bar">
                    <div 
                        className="workflow-progress-filled"
                        style={{width: percent_done + "%"}}
                    />
                </div>
                {progress.done} / {progress.total}
            </div>
        );
    }

    formatPay(cents) {
        return "$" + Math.floor(cents/100) + "." + pad(cents%100, 2);
    }

    renderEarnings() {
        let earnings = getWorkflowEarnings(
            this.props.workflow_instance,
            this.props.coop_instance,
            Meteor.userId(),
        );
        return (
            <div className="workflow-earnings">
                {/*"Base: "
                    + this.formatPay(earnings.base) 
                    + ' / Bonus: '
                    + this.formatPay(earnings.bonus)
                */}
                {
                    "Bonus: " + this.formatPay(earnings.bonus)
                }
            </div>
        );
    }

    render() {
        return (
            <div className="workflow-header">
                <div className="workflow-user">
                    Username: {Meteor.user().username + ' '}
                </div>
                {this.renderProgress()}
                {this.renderEarnings()}
            </div>
        );
    }
}

class Workflow extends Component {
    advanceWorkflowStage() {
        Meteor.call(
            'workflowinstances.advanceStage',
            this.props.workflow_instance._id,
        );
    }

    skipToWorkflowEnd() {
        Meteor.call(
            'workflowinstances.skipToEnd',
            this.props.workflow_instance._id,
        );
    }

    renderStage() {
        console.log(this.props);        
        let workflow = Workflows.findOne({_id: this.props.workflow_instance.workflow_id});
        let stage_num = this.props.workflow_instance.stage;
        let stages = workflow.stages;
        let stage = stages[stage_num];
        if(stage_num < 0) {
            stage = stages[stages.length - 1];
        }
        

        switch(stage.type) {
            case WorkflowStages.CONSENT:
                console.log(stage.id);
                let consentform = ConsentForms.findOne({_id: stage.id});
                return (
                    <ConsentForm 
                        consentform={consentform}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.SURVEY:
                let survey = Surveys.findOne({_id: stage.id});
                return (
                    <Survey 
                        survey={survey}
                        workflow_instance_id={this.props.workflow_instance._id}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.FEEDBACK:
                let feedback_letter = FeedbackLetters.findOne({_id: stage.id});
                let confirm_code = this.props.workflow_instance.confirm_code
                // Note: no finished callback for feedback letters
                return (
                    <FeedbackLetter
                        feedbackLetter={feedback_letter}
                        confirmCode={confirm_code}
                    />
                );

            case WorkflowStages.COOP:
                return (
                    <CoopWorkflow
                        coop_instance={this.props.coop_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                        lobbyFailedCallback={this.skipToWorkflowEnd.bind(this)}
                    />
                );

            case WorkflowStages.TUTORIAL:
                let tutorial = Tutorials.findOne({_id: stage.id});
                return (
                    <TutorialScreen 
                        tutorial={tutorial}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.AUDIO_RATING:
                // TODO
                let rating_instance = null;
                
                return (
                    <AudioRatingScreen
                        audio_rating_instance={rating_instance}
                    />
                )
        }
    }

    render() {
        if(!this.props.ready) {
            return null;
        }

        // Get a workflow if we don't have one
        if(!this.props.workflow_instance) {
            Meteor.call(
                'workflowinstances.setUpWorkflow',
                Meteor.user()._id,
            )
            return <div>Setting things up for you...</div>
        }
        else {
            return (
                <div>
                    <WorkflowHeader
                        workflow_instance={this.props.workflow_instance}
                        coop_instance={this.props.coop_instance}
                     />
                    {this.renderStage()}

                    <span id="audio"></span>
                    {/* Hack: keep this around at the parent level so the audio doesn't stop */}
                </div>
            );
        }
    }
}


export default WorkflowContainer = withTracker((props) => {
    let puzzle_handle = null;
    let audio_handle = null;
    let ready = true;

    if(props.coop_instance) {
        let stage_ids = props.coop_instance.output;
        audio_handle = Meteor.subscribe('audioinstances.inList', stage_ids);
        ready = audio_handle.ready();
        //puzzle_handle = Meteor.subscribe('puzzleinstances.inList', stage_ids);
        //ready = puzzle_handle.ready() && audio_handle.ready();
    }

    return {
        ready: ready,
        workflow_instance: props.workflow_instance,
        coop_instance: props.coop_instance,
        // Hack
        audio_instances: AudioInstances.find().fetch(),
    };
})(Workflow);