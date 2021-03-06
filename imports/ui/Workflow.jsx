import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';
import {FeedbackLetter} from './FeedbackLetter.jsx';
import {TutorialScreen} from './Tutorial.jsx';
import {TutorialScreenRating} from './TutorialRating.jsx';
import {AudioTask} from './AudioTask.jsx';
import {AudioRatingTask} from './AudioRatingTask.jsx';

import {Workflows, WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';
import {FeedbackLetters} from '../api/feedbackLetters.js';
import {Tutorials} from '../api/tutorials.js';
import {WorkflowInstances, getWorkflowProgress, getWorkflowEarnings} from '../api/workflowInstances.js';
import {AudioInstances} from '../api/audioInstances.js';
import {AudioTasks} from '../api/audioTasks.js';
import {AudioRatingTasks} from '../api/audioRatingTasks.js';
import {centsToString} from '../api/utils.js';

export class WorkflowProgressBar extends Component {
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
                    <WorkflowProgressBar 
                        num_stages={this.props.num_stages - 1}
                        current_stage={this.props.current_stage}
                    /> 
                    {this.props.current_stage} / {this.props.num_stages - 1}
                </div>
                <div className="workflow-earnings">
                    {"Bonus: " + centsToString(this.props.bonus_cents)}
                </div>
            </div>
        );
    }
}

class Workflow extends Component {
    advanceWorkflowStage(stage_num) {
        Meteor.call(
            'workflowinstances.advanceStage',
            this.props.workflow,
            this.props.workflow_instance,
            stage_num,
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
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
                    />
                );

            case WorkflowStages.SURVEY:
                let survey = Surveys.findOne({_id: stage.id});
                return (
                    <Survey 
                        survey={survey}
                        workflow_instance={this.props.workflow_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
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
                let tutorial_instance_id = this.props.workflow_instance.output[stage_num];
                let tutorial_instance = AudioInstances.findOne({_id: tutorial_instance_id});
                let tutorial_task = AudioTasks.findOne({_id: tutorial_instance.audio_task}, {reactive: false})
                return (
                    <TutorialScreen 
                        audio_task={tutorial_task}
                        audio_instance={tutorial_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
                    />
                );

            case WorkflowStages.TUTORIAL_RATING:
                let tutorial_rating_task = AudioRatingTasks.findOne({_id: stage.id})
                return (
                    <TutorialScreenRating
                        audio_rating_task={tutorial_rating_task}
                        workflow_instance={this.props.workflow_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
                    />
                );

            case WorkflowStages.AUDIO_TASK:
                let audio_instance_id = this.props.workflow_instance.output[stage_num];
                let audio_instance = AudioInstances.findOne({_id: audio_instance_id});
                let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task}, {reactive: false})
                return (
                    <AudioTask
                        audio_task={audio_task}
                        audio_instance={audio_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
                    />
                )

            case WorkflowStages.AUDIO_RATING:
                let rating_task = AudioRatingTasks.findOne({_id: stage.id})
                console.log(rating_task);
                return (
                    <AudioRatingTask
                        audio_rating_task={rating_task}
                        workflow_instance={this.props.workflow_instance}
                        finishedCallback={this.advanceWorkflowStage.bind(this, stage_num)}
                    />
                )
        }
    }

    render() {
        if(!this.props.ready) {
            return (
                <div>Connecting to server...</div>
            );
        }

        // Get a workflow if we don't have one
        if(!this.props.workflow_instance) {
            Meteor.call(
                'workflowinstances.setUpWorkflow',
                this.props.worker_id,
                this.props.assignment_id,
            )
            return <div>Setting up the experiment for you...</div>
        }
        else {
            let progress = getWorkflowProgress(
                this.props.workflow,
                this.props.workflow_instance,
            );

            let bonus = getWorkflowEarnings(
                this.props.workflow,
                this.props.workflow_instance,
            );
            return (
                <div>
                    <WorkflowHeader
                        username={this.props.worker_id + ' '}
                        num_stages={progress.total}
                        current_stage={progress.done}
                        bonus_cents={bonus}
                        workflow_instance={this.props.workflow_instance}
                     />
                    {this.renderStage()}

                    {/* Hack: keep this around at the parent level so the audio doesn't stop */}
                    <span id="audio"></span>
                </div>
            );
        }
    }
}


export default WorkflowContainer = withTracker((props) => {
    // TODOLATER: handle cases where user has joined more than one workflow
    // For now, assume there's only one
    // Note that UI deals with case where this is undefined
    // Feels weird to do this out of order, but necessary for subscriptions
    let workflow_instance = WorkflowInstances.findOne();
    let workflow_id = null;
    let instance_id_list = [];
    let workflow = null;
    let stage_id_list = [];

    if(workflow_instance) {
        workflow_id = workflow_instance.workflow_id;
        instance_id_list = workflow_instance.output;
        workflow = Workflows.findOne({_id: workflow_id});
    }

    if(workflow) {
        stage_id_list = workflow.stages.map(stage => stage.id);
    }


    const sub = [
        // Static subscriptions
        Meteor.subscribe('consentforms'),
        Meteor.subscribe('surveys'),
        Meteor.subscribe('feedbackletters'),
        Meteor.subscribe('tutorials'),
        Meteor.subscribe('audioratingtasks'),

        // Dynamic subscriptions
        Meteor.subscribe('workflows.id', workflow_id),
        Meteor.subscribe('audiotasks.id_list', stage_id_list),
        Meteor.subscribe('workflowinstances.worker_id', props.worker_id),
        Meteor.subscribe('audioinstances.id_list', instance_id_list),
        // TODOLATER: is this subscription even necessary?
        Meteor.subscribe('surveyinstances.id_list', instance_id_list),
    ];

    // Check if ready by putting together subscriptions
    let all_ready = true;
    sub.forEach((sub_item, idx) => {
        if(!sub_item.ready())
        {
            all_ready = false;
        }
    });

    return {
        ready: all_ready,

        worker_id: props.worker_id,
        assignment_id: props.assignment_id,

        workflow: workflow,
        workflow_instance: workflow_instance,

        // Hack: update whenever our audio instances change
        audio_instances: AudioInstances.find().fetch(),
    };
})(Workflow);