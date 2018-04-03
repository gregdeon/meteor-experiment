// workflowInstances.js
// Collection for describing user's progress in a workflow steps
// Contents:
// - user_id: reference to user
// - workflow_id: reference to workflow
// - stage: current stage of the user
// - confirm_code: UUID (TODO: generate this with Random.id() from 'meteor/random')

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {Workflows} from './workflows.js';

export const WorkflowInstances = new Mongo.Collection('workflowinstances');

if (Meteor.isServer) {
    Meteor.publish('workflowinstances', function workflowInstancePublication(){
        // TODO: only publish user's workflow
        return WorkflowInstances.find();
    });
}

Meteor.methods({
    'workflowinstances.advanceStage'(instance_id) {
        let instance = WorkflowInstances.findOne({_id: instance_id});
        let workflow = Workflows.findOne({_id: instance.workflow_id});

        let stage = instance.stage;
        let new_stage = stage + 1;
        let num_stages = workflow.stages.length;

        if(new_stage < num_stages) {
            let upd = {stage: new_stage};
            if(new_stage === num_stages - 1) {
                // generate confirm_code here
                upd.confirm_code = "ABC123";
            }
            WorkflowInstances.update(instance_id, {
                $set: upd
            });
        }
    }
});