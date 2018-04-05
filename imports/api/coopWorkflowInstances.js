// workflowInstances.js
// Collection for describing a group's progress in a co-op workflow
// Contents:
// - user_ids: list of references to users
// - coop_id: reference to coop workflow
// - stage: current stage of the group
// - output: list of instances describing work done at each stage (like PuzzleInstances)

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {CoopWorkflows} from './coopWorkflows.js';

export const CoopWorkflowInstances = new Mongo.Collection('coopworkflowinstances', {
    idGeneration: 'MONGO',
});

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

export function getPlayerNumber(user_id, coop_instance) {
    return coop_instance.user_ids.indexOf(user_id);
}