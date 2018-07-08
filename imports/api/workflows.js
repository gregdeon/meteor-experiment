// workflows.js
// Collection for describing experiment steps
// Contents:
// - number: if there are multiple workflows, when should this one be assigned?
// - stages: list of objects with
//   - type: one of WorkflowStages
//   - id: ID of a consent form, survey, feedback letter, etc

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Workflows = new Mongo.Collection('workflows', {
    idGeneration: 'MONGO',
});

export const WorkflowStages = {
    CONSENT: 0, 
    SURVEY: 1,
    FEEDBACK: 2,
    COOP: 3,
    TUTORIAL: 4,
    AUDIO_RATING: 5,
};

if (Meteor.isServer) {
    Meteor.publish('workflows', function workflowPublication(){
        return Workflows.find();
    });
}
