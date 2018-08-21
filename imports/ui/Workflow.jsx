import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';
import {TutorialScreen} from './Tutorial.jsx';
import {AudioRatingScreen} from './AudioRatingTask.jsx';

import {Workflows, WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';
import {Tutorials} from '../api/tutorials.js';
import {getWorkflowProgress, getWorkflowEarnings} from '../api/workflowInstances.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {AudioInstances} from '../api/audioInstances.js';
import {AudioRatingInstances} from '../api/audioRatingInstances.js';
import {centsToString} from '../api/utils.js';

export class ProgressBar extends Component {
    render() {
        let percent_done = this.props.current_stage / this.props.num_stages * 100;
        return <div className="workflow-progress-bar">
            <div 
                className="workflow-progress-filled"
                style={{width: percent_done + "%"}}
            />
        </div>
    }
}

export class WorkflowHeader extends Component {
    render() {
        return (
            <div className="workflow-header">
                <div className="workflow-user">
                    Username: {this.props.username}
                </div>            
                <div className="workflow-progress">
                    Progress: 
                    <ProgressBar 
                        num_stages={this.props.num_stages}
                        current_stage={this.props.current_stage}
                    /> 
                    {this.props.current_stage} / {this.props.num_stages}
                </div>
                <div className="workflow-earnings">
                    {"Bonus: " + centsToString(this.props.bonus_cents)}
                </div>
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

            case WorkflowStages.TUTORIAL:
                let tutorial = Tutorials.findOne({_id: stage.id});
                return (
                    <TutorialScreen 
                        tutorial={tutorial}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
                    />
                );

            case WorkflowStages.AUDIO_RATING:
                let output_id = this.props.workflow_instance.output[stage_num];
                let rating_instance = AudioRatingInstances.findOne({_id: output_id});

                return (
                    <AudioRatingScreen
                        rating_instance={rating_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this)}
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
            let progress = getWorkflowProgress(
                this.props.workflow_instance,
            );

            let earnings = getWorkflowEarnings(
                this.props.workflow_instance,
                Meteor.userId(),
            );
            return (
                <div>
                    <WorkflowHeader
                        username={Meteor.user().username + ' '}
                        num_stages={progress.total}
                        current_stage={progress.done}
                        bonus_cents={earnings.bonus}
                        workflow_instance={this.props.workflow_instance}
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

    // TODO: subscribe to output list from regular workflow instance
    /*
    if(props.coop_instance) {
        let stage_ids = props.coop_instance.output;
        audio_handle = Meteor.subscribe('audioinstances.inList', stage_ids);
        ready = audio_handle.ready();
        //puzzle_handle = Meteor.subscribe('puzzleinstances.inList', stage_ids);
        //ready = puzzle_handle.ready() && audio_handle.ready();
    }
    */

    return {
        ready: ready,
        workflow_instance: props.workflow_instance,
        // Hack
        audio_instances: AudioInstances.find().fetch(),
    };
})(Workflow);