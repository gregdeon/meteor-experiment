// workflowInstances.js
// Collection for describing user's progress in a workflow steps
// Contents:
// - user_id: reference to user
// - workflow_id: reference to workflow
// - stage: current stage of the user
// - confirm_code: UUID for confirmation code

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {Random} from 'meteor/random';

import {Workflows} from './workflows.js';

export const WorkflowInstances = new Mongo.Collection('workflowinstances');

if (Meteor.isServer) {
    Meteor.publish('workflowinstances', function(){
        // If they're logged in, show their instances
        if(this.userId) {
            return WorkflowInstances.find({user_id: this.userId});
        }
        else {
            return null;
        }
    });
}

Meteor.methods({
    'workflowinstances.setUpWorkflow'(user_id, workflow_id) {
        // DEBUG
        console.log("Making workflow instance for " + user_id);

        // Try to find an instance for them
        let instance = WorkflowInstances.findOne({
            user_id: user_id,
            workflow_id: workflow_id,
        });

        // They have one, so 
        if(instance) {
            return;
        }

        // None exist, so make a new one instead
        // No need to return - props will get updated right away
        WorkflowInstances.insert({
            user_id: user_id,
            workflow_id: workflow_id,
            stage: 0,
            confirm_code: null,
        })
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
                upd.confirm_code = Random.id();
            }

            WorkflowInstances.update(instance_id, {
                $set: upd
            });
        }
    },
});