// coopWorkflows.js
// Collection for describing steps of an experiment with multiple people
// Contents:
// - size: number of players required (assuming exact)
// - stages: list of objects with
//   - type: one of WorkflowStages
//   - id: ID of a lobby, game, etc
// - lobby_time: number of minutes to wait in the lobby before skipping the workflow

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const CoopWorkflows = new Mongo.Collection('coopworkflows', {
    idGeneration: 'MONGO',
});

export const CoopWorkflowStages = {
    LOBBY: 0,
    PUZZLE: 1,
    AUDIO: 2,
};

if (Meteor.isServer) {
    Meteor.publish('coopworkflows', function(){
        return CoopWorkflows.find();
    });
}
