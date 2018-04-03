// workflowInstances.js
// Collection for describing a group's progress in a co-op workflow
// Contents:
// - user_ids: list of references to users
// - coop_id: reference to coop workflow
// - stage: current stage of the group

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {CoopWorkflows} from './coopWorkflows.js';

export const CoopWorkflowInstances = new Mongo.Collection('coopworkflowinstances');

if (Meteor.isServer) {
    Meteor.publish('coopworkflowinstances', function(){
        // If they're logged in, show their instances
        if(this.userId) {
            return CoopWorkflowInstances.find(
                {
                    user_ids: this.userId,
                }
            );
        }
        else {
            return this.ready();
        }
    });
}

export function isFull(coop_instance) {
    let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id});
    let full_size = coop_workflow.size;
    return (coop_instance.user_ids.length === full_size);
}

Meteor.methods({
    'coopworkflowinstances.setUpWorkflow'(user_id) {
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

        // They have one, so 
        if(coop_instance) {
            return;
        }

        // Join an existing group or make a new one
        CoopWorkflowInstances.upsert(
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
    },

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
