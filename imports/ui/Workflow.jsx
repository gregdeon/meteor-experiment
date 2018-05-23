import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';
import {CoopWorkflow} from './CoopWorkflow.jsx';
import {TutorialScreen} from './Tutorial.jsx';

import {Workflows, WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';
import {Tutorials} from '../api/tutorials.js';
import {CoopWorkflows} from '../api/coopWorkflows.js';
import {getWorkflowProgress, getWorkflowEarnings} from '../api/workflowInstances.js';

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

export class Workflow extends Component {
    advanceWorkflowStage() {
        Meteor.call(
            'workflowinstances.advanceStage',
            this.props.workflowInstance._id,
        );
    }

    skipToWorkflowEnd() {
        Meteor.call(
            'workflowinstances.skipToEnd',
            this.props.workflowInstance._id,
        );
    }

    renderStage() {
        console.log(this.props);        
        let workflow = Workflows.findOne({_id: this.props.workflowInstance.workflow_id});
        let stage_num = this.props.workflowInstance.stage;
        let stages = workflow.stages;
        
        let stage = stages[stage_num];

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
                        workflow_instance_id={this.props.workflowInstance._id}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.FEEDBACK:
                let feedback_letter = FeedbackLetters.findOne({_id: stage.id});
                let confirm_code = this.props.workflowInstance.confirm_code
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
                        coop_instance={this.props.coopInstance}
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
        }
    }

    render() {
        // Get a workflow if we don't have one
        if(!this.props.workflowInstance) {
            this.props.history.push('/start/');
            return <div>Setting things up for you...</div>
        }
        else {
            return (
                <div>
                    <WorkflowHeader
                        workflow_instance={this.props.workflowInstance}
                        coop_instance={this.props.coopInstance}
                     />
                    {this.renderStage()}

                    <span id="audio"></span>
                    {/* Hack: keep this around at the parent level so the audio doesn't stop */}
                </div>
            );
        }
    }
}