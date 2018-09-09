// audioRatingInstances.js
// Collection for storing the results of an audio rating task
// Contents:
// - task_id: ID of an AudioRatingTask
// - workflow_instance_id: ID of the workflow (to find the user/experiment)
// - rating: answer to rating question
// - time_submitted: date object 

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {addOutputToInstance} from './workflowInstances.js';

export const AudioRatingInstances = new Mongo.Collection('audioratinginstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audioratinginstances', function publish(){
        // TODOLATER: this publish function should be more selective
        // We probably don't need to publish anything, actually
        return AudioRatingInstances.find();
    });
}

Meteor.methods({
    'audioRatingInstances.submitRating'(task_id, rating, time_submitted, workflow_instance) {
        let rating_instance_id = AudioRatingInstances.insert({
            task_id: task_id,
            workflow_instance_id: workflow_instance._id,
            rating: response,
            time_submitted: time_submitted,
        })

        addOutputToInstance(workflow_instance._id, workflow_instance.stage, rating_instance_id);
    }
})
