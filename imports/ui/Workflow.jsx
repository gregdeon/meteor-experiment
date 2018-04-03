import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';

import {WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';



export class Workflow extends Component {
    advanceWorkflowStage() {
        Meteor.call(
            'workflowinstances.advanceStage',
            this.props.workflowInstance._id,
        );
    }

    render() {
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
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.FEEDBACK:
                let feedback_letter = FeedbackLetters.findOne({_id: stage.id});
                let confirm_code = this.props.workflowInstance.confirm_code
                return (
                    <FeedbackLetter
                        feedbackLetter={feedback_letter}
                        confirmCode={confirm_code}
                    />
                );

            case WorkflowStages.COOP:
                return (
                    <div>TODO: coop workflow</div>
                );
        }
    }
}