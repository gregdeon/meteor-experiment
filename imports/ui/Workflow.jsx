import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';
import {CoopWorkflow} from './CoopWorkflow.jsx';

import {WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';
import {CoopWorkflows} from '../api/coopWorkflows.js';

class WorkflowHeader extends Component {
    render() {
        return (
            <div className="workflow-header">
                <div className="workflow-user">
                    Username: {Meteor.user().username + ' '}
                </div>
                <div className="workflow-progress">
                    Progress: TODO
                </div>
                <div className="workflow-earnings">
                    Earnings: TODO
                </div>
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

    renderStage() {
        console.log(this.props);
        let stage_num = this.props.workflowInstance.stage;
        let stages = this.props.workflow.stages;
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
                let coop_workflow = CoopWorkflows.findOne({_id: stage.id});
                return (
                    <CoopWorkflow 
                        coop_workflow={coop_workflow}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );
        }
    }

    render() {
        // Get a workflow if we don't have one
        if(!this.props.workflowInstance) {
            Meteor.call(
                'workflowinstances.setUpWorkflow',
                Meteor.user()._id,
                this.props.workflow._id,
            )

            return (<div>Setting things up for you...</div>);
        }

        let stage_view = this.renderStage();
        return (
            <div>
                <WorkflowHeader />
                {stage_view}
            </div>
        );
    }
}