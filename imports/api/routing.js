// Utilities for creating object instances during experiments

import {Meteor} from 'meteor/meteor';

import {CoopWorkflows, CoopWorkflowStages} from './coopWorkflows.js';
import {CoopWorkflowInstances} from './coopWorkflowInstances.js';

import {addPuzzleInstance} from './puzzleInstances.js';

export function isFull(coop_instance) {
    let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id});
    let full_size = coop_workflow.size;
    return (coop_instance.user_ids.length === full_size);
}

export function initializeOutput(stage) {
    console.log(stage);
    switch(stage.type) {
        case CoopWorkflowStages.LOBBY:
            return null;

        case CoopWorkflowStages.PUZZLE:
            let puzzle_id = stage.id;
            let output_id = addPuzzleInstance(puzzle_id);
            return output_id;
    }

    return null;
}

Meteor.methods({
    // Join a coop workflow
    'coopworkflowinstances.setUpWorkflow'() {
        let user_id = this.userId;
        // DEBUG
        console.log("Making coop workflow instance for " + user_id);

        // TODO: find the coop workflow that they should use
        // For now, just assume there's only one
        let coop_workflow = CoopWorkflows.findOne();

        // Try to find an instance for them
        let coop_instance = CoopWorkflowInstances.findOne(
            {
                user_ids: [user_id],
                coop_id: coop_workflow._id,
            },
        );

        // They have one, so don't join a new one
        if(coop_instance) {
            return;
        }

        // Join an existing group or make a new one
        let upsert_output = CoopWorkflowInstances.upsert(
            // Query
            {
                // TODO: make this work for any number of players
                'user_ids.2': {$exists: false},
                coop_id: coop_workflow._id,
                stage: 0,
            },
            // Update/insert
            {
                $push: {
                    user_ids: user_id,
                },
            },
        );
        // If we made the group, also initialize our group's outputs
        console.log("Upsert output:");
        console.log(upsert_output);

        if(upsert_output.insertedId) {
            coop_workflow.stages.map((stage, idx) => {
                let output_id = initializeOutput(stage);
                console.log(CoopWorkflowInstances.update(
                    {_id: upsert_output.insertedId},
                    {$push: {
                        output: output_id,
                    }},
                ));
            });
        }
    },

    // Move on to the next stage in a coop workflow
    'coopworkflowinstances.advanceStage'(instance_id, current_stage) {
        let instance = CoopWorkflowInstances.findOne({_id: instance_id});
        let coop_workflow = CoopWorkflows.findOne({_id: instance.coop_id});

        let stage = instance.stage;
        let new_stage = current_stage + 1;
        let num_stages = coop_workflow.stages.length;

        if(stage === current_stage) {
            if(new_stage <= num_stages) {
                CoopWorkflowInstances.update(instance_id, {
                    $set: {stage: new_stage},
                });
            }
        }
        
        return (new_stage === num_stages);
    }
});
