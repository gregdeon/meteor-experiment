// workflowInstances.js
// Collection for describing user's progress in a workflow steps
// Contents:
// - user_id: reference to user
// - workflow_id: reference to workflow
// - stage: current stage of the user
// - output: list of IDs of stage instances (task instances, survey instances, etc)
//   (note: output list doesn't include all stage types. TODO.)
// - assign_id: MTurk assignment ID
// - confirm_code: UUID for confirmation code

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {Random} from 'meteor/random';

import {Workflows, WorkflowStages} from './workflows.js';
import {CoopWorkflows, CoopWorkflowStages} from './coopWorkflows.js';
import {getPlayerNumber} from '../api/coopWorkflowInstances.js';
import {getRewards} from './scoreFunctions.js';
import {Puzzles} from './puzzles.js';
import {PuzzleInstances} from './puzzleInstances.js';
import {AudioInstances} from './audioInstances.js';
import {createAudioRatingInstance} from './audioRatingInstances.js';

export const WorkflowInstances = new Mongo.Collection('workflowinstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('workflowinstances', function(){
        // If they're logged in, show their instances
        if(this.userId) {
            return WorkflowInstances.find({user_id: this.userId});
        }
        else {
            return this.ready();
        }
    });
}

export function getWorkflowProgress(instance, coop_instance) {
    let workflow = Workflows.findOne({_id: instance.workflow_id});
    /*
    let coop_workflow = (
        coop_instance 
        ? CoopWorkflows.findOne({_id: coop_instance.coop_id})
        : null
    );*/

    let done = 0;
    let total = 0;
    workflow.stages.map((stage, idx) => {
        switch(stage.type) {
            case WorkflowStages.CONSENT:
            case WorkflowStages.SURVEY:
            case WorkflowStages.FEEDBACK:
            case WorkflowStages.TUTORIAL:
            case WorkflowStages.AUDIO_RATING:
                total += 1;
                if(instance.stage > idx)
                    done += 1;
                break;
            
            case WorkflowStages.COOP:
                // TODO: this assumes that all workflows have the same length
                let coop_workflow = CoopWorkflows.findOne({_id: stage.id[0]})
                total += coop_workflow.stages.length;

                if(coop_instance) {
                    if(coop_instance.stage < 0) {
                        done += coop_workflow.stages.length;
                    }
                    else {
                        done += coop_instance.stage;
                    }
                } 
                break;
        }
    })

    return {
        done: done,
        // Don't count the very last step
        total: total-1,
    };
}

export function getWorkflowEarnings(instance, coop_instance, user_id) {
    let base = 0;
    let bonus = 0;

    console.log(user_id);

    // TODO: this function assumes that the regular workflow is worth nothing
    if(coop_instance) {
        let player_num = getPlayerNumber(user_id, coop_instance);
        let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id});
        if(coop_instance.ready_state == 2) {
            coop_workflow.stages.map((stage, idx) => {
                let rewards = [0, 0, 0]
                // No money for stages we haven't done yet
                if(idx >= coop_instance.stage)
                    return;

                switch(stage.type) {
                    case CoopWorkflowStages.PUZZLE:
                        let puzzle_instance_id = coop_instance.output[idx];
                        let puzzle_instance = PuzzleInstances.findOne(puzzle_instance_id);
                        let puzzle = Puzzles.findOne(puzzle_instance.puzzle);
                        rewards = getRewards(
                            puzzle_instance,
                            puzzle.reward_mode,
                            puzzle.score_mode,
                        )
                        console.log(rewards);
                        console.log(player_num);

                        // TODO: don't assume 50 cents
                        base += 50;
                        bonus += rewards[player_num];
                        break;

                    case CoopWorkflowStages.AUDIO:
                        let audio_id = coop_instance.output[idx];
                        let audio_instance = AudioInstances.findOne(audio_id);
                        rewards = audio_instance.bonuses;

                        base += 25;
                        bonus += rewards[player_num];
                        break;
                }
            });
        }
    }

    return {
        base: base,
        bonus: bonus,
    };
}

Meteor.methods({
    'workflowinstances.setUpWorkflow'(user_id) {
        // DEBUG
        console.log("Making workflow instance for " + user_id);

        // TODO: find the workflow that they should use
        // For now, just assume there's only one
        let workflow = Workflows.findOne();

        // Try to find an instance for them
        let instance = WorkflowInstances.findOne({
            user_id: user_id,
            workflow_id: workflow._id,
        });

        // They have one, so 
        if(instance) {
            return;
        }

        // None exist, so make a new one instead
        let output_list = [];

        // Build output list
        // TODO: this should be more generic instead of a switch-case
        for(let i = 0; i < workflow.stages.length; i++) {
            let stage = workflow.stages[i];
            let output_id = null;
            switch(stage.type) {
                case WorkflowStages.AUDIO_RATING:
                    let task_id = stage.id;
                    output_id = createAudioRatingInstance(task_id);
                    break;
            }

            output_list.push(output_id);
        }
        
        // Add instance to the database
        WorkflowInstances.insert({
            user_id: user_id,
            workflow_id: workflow._id,
            stage: 0,
            output: output_list,
            confirm_code: null,
        })

        // No need to return - props will get updated right away
    },

    'workflowinstances.advanceStage'(instance_id) {
        let instance = WorkflowInstances.findOne({_id: instance_id});
        let workflow = Workflows.findOne({_id: instance.workflow_id});

        let stage = instance.stage;
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

            WorkflowInstances.update(instance_id, {
                $set: upd
            });
        }
    },

    // TODO: refactor this to avoid duplicating confirm code generation
    'workflowinstances.skipToEnd'(instance_id) {
        let instance = WorkflowInstances.findOne({_id: instance_id});
        let workflow = Workflows.findOne({_id: instance.workflow_id});

        let num_stages = workflow.stages.length;
        let new_stage = num_stages - 1;

        let upd = {stage: new_stage};

        if(this.isSimulation) {
            upd.confirm_code = "Generating, please wait...";
        } 
        else {
            upd.confirm_code = Random.id();
        }

        WorkflowInstances.update(instance_id, {
            $set: upd
        });
    },
});