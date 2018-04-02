// workflowInstances.js
// Collection for describing user's progress in a workflow steps
// Contents:
// - user_id: reference to user
// - workflow_id: reference to workflow
// - stage: current stage of the user
// - confirm_code: UUID (TODO: generate this with Random.id() from 'meteor/random')

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const WorkflowInstances = new Mongo.Collection('workflowinstances');

if (Meteor.isServer) {
    Meteor.publish('workflowinstances', function workflowInstancePublication(){
        // TODO: only publish user's workflow
        return WorkflowInstances.find();
    });
}
