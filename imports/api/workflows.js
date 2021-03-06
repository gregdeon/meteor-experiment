// workflows.js
// Collection for describing experiment steps
// Contents:
// - number: if there are multiple workflows, when should this one be assigned?
// - stages: list of objects with
//   - type: one of WorkflowStages
//   - id: ID of a consent form, survey, feedback letter, etc
// - team_worker_ids: list of worker IDs for [teammate 1, teammate 2]
// - team_assign_ids: list of assignment IDs for [teammate 1, teammate 2]

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Workflows = new Mongo.Collection('workflows', {
    idGeneration: 'MONGO',
});

export const WorkflowStages = {
    CONSENT: 0, 
    SURVEY: 1,
    FEEDBACK: 2,
    TUTORIAL: 4, // audio task tutorial
    AUDIO_RATING: 5,
    AUDIO_TASK: 6,
    TUTORIAL_RATING: 7,
};

if (Meteor.isServer) {
    Meteor.publish('workflows', function workflowPublication(){
        return Workflows.find();
    });
    Meteor.publish('workflows.id', function(workflow_id) {
        return Workflows.find({_id: workflow_id});
    })
}
