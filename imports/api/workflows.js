// workflow.js
// Collection for describing experiment steps
// Contents:
// - stages: list of WorkflowStages

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Workflows = new Mongo.Collection('workflows');

export const WorkflowStages = {
    CONSENT: 0, 
    SURVEY: 1,
    FEEDBACK: 2,
    COOP: 3,
};

if (Meteor.isServer) {
    Meteor.publish('workflows', function workflowPublication(){
        return Workflows.find();
    });
}
