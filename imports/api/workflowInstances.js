// workflowInstances.js
// Collection for describing user's progress in a workflow steps
// Contents:
// - worker_id: MTurk worker ID
// - assign_id: MTurk assignment ID
// - hit_id: MTurk HIT ID
// - workflow_id: reference to workflow
// - stage: current stage of the user
// - output: list of IDs of stage instances (task instances, survey instances, etc)
//   (note: output list doesn't include all stage types. TODO.)
// - time_started: list of start times for each stage
// - confirm_code: UUID for confirmation code

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {Random} from 'meteor/random';

import {incrementCounter} from 'meteor/konecty:mongo-counter';

import {Workflows, WorkflowStages} from './workflows.js';
import {getRewards} from './scoreFunctions.js';
import {AudioInstances, createAudioTaskInstance} from './audioInstances.js';
import {createAudioRatingInstance} from './audioRatingInstances.js';

import {Counters, getAndIncrementCounter} from './utils.js';

export const WorkflowInstances = new Mongo.Collection('workflowinstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('workflowinstances', function(){
        return WorkflowInstances.find({});
    });
    Meteor.publish('workflowinstances.worker_id', function(worker_id) {
        return WorkflowInstances.find({worker_id: worker_id})
    })
}

export function makeNewWorkflowInstance(workflow, worker_id, assign_id, hit_id) {
    let output_list = workflow.stages.map((stage) => {
        // TODOLATER: do something more generic than a switch case?
        switch(stage.type) {
            case WorkflowStages.AUDIO_TASK:
                return createAudioTaskInstance(stage.id);
            case WorkflowStages.AUDIO_RATING:
                return createAudioRatingInstance(stage.id);
            case WorkflowStages.TUTORIAL:
                return createAudioTaskInstance(stage.id);

            // It's possible to back-reference the stage instance ID to match it up with the workflow
            // This means that returning null isn't catastrophic
            // However, analyzing the data is easier if we don't do this
            default:
                return null;
        }
    })

    let time_started_list = workflow.stages.map((stage) => null);

    return {
        worker_id: worker_id,
        assign_id: assign_id,
        hit_id: hit_id,
        workflow_id: workflow._id,
        output: output_list,
        time_started: time_started_list,
        stage: 0,
        confirm_code: null,
    }
}

export function getWorkflowProgress(workflow, instance) {
    let done = 0;
    let total = 0;

    // Do a forEach here in case we want 
    workflow.stages.forEach((stage, idx) => {
        switch(stage.type) {
            case WorkflowStages.CONSENT:
            case WorkflowStages.SURVEY:
            case WorkflowStages.FEEDBACK:
            case WorkflowStages.TUTORIAL:
            case WorkflowStages.AUDIO_RATING:
            case WorkflowStages.AUDIO_TASK:
                total += 1;
                if(instance.stage > idx)
                    done += 1;
                break;
        }
    })

    return {
        done: done,
        total: total,
    };
}

export function getWorkflowEarnings(workflow, instance) {
    let bonus = 0;

    workflow.stages.forEach((stage, idx) => {
        switch(stage.type) {
            case WorkflowStages.AUDIO_TASK:
                let stage_instance_id = instance.output[idx];
                let stage_instance = AudioInstances.findOne({_id: stage_instance_id});
                if(stage_instance) {
                    let stage_bonuses = stage_instance.bonuses;
                    if(stage_bonuses) {
                        // Hard coded for player 3
                        bonus += stage_bonuses[2];
                    }
                }
                break;
        }
    })

    return bonus;
}

// Server function: add an ID to the output list
export function addOutputToInstance(instance_id, stage_num, output_id) {
    let upd = {};
    upd["output." + stage_num] = output_id;
    WorkflowInstances.update(
        {_id: instance_id},
        {$set: upd},
    );
}

// Server function: add a timestamp to the time_started list
export function addTimestampToInstance(instance_id, stage_num, time_started) {
    let upd = {};
    upd["time_started." + stage_num] = time_started;
    WorkflowInstances.update(
        {_id: instance_id},
        {$set: upd},
    );
}

Meteor.methods({
    'workflowinstances.setUpWorkflow'(worker_id, assign_id, hit_id) {
        if(Meteor.isClient) {
            return;
        }

        // DEBUG
        console.log("Making workflow instance for " + worker_id);

        // Don't make them an instance if they already have one
        if(WorkflowInstances.find({worker_id: worker_id}).count() > 0) {
            return;
        }
        
        // None exist, so make a new one instead
        // Find the workflow that they should use
        let num_workflows = Workflows.find().count();
        let workflow_num = (getAndIncrementCounter('workflow_instances')) % num_workflows;
        let workflow = Workflows.findOne({number: workflow_num});
        console.log(workflow_num);

        // Add instance to the database
        let workflow_instance = makeNewWorkflowInstance(workflow, worker_id, assign_id, hit_id);
        let workflow_instance_id = WorkflowInstances.insert(workflow_instance);

        // Add first timestamp
        addTimestampToInstance(workflow_instance_id, 0, new Date());
    },

    'workflowinstances.advanceStage'(workflow, instance, current_stage) {
        let stage = instance.stage;
        // Don't advance if they're on the wrong stage
        if(stage != current_stage) {
            return;
        }

        let new_stage = stage + 1;
        let num_stages = workflow.stages.length;

        if(new_stage < num_stages) {
            let upd = {stage: new_stage};

            // Generate a confirmation code on the final stage
            if(new_stage === num_stages - 1) {
                // We can't actually generate one on the client-side
                if(this.isSimulation) {
                    upd.confirm_code = "Generating, please wait...";
                } 
                else {
                    upd.confirm_code = Random.id();
                }
            }

            WorkflowInstances.update(instance._id, {
                $set: upd
            });


            addTimestampToInstance(instance._id, new_stage, new Date());
        }
    },
});