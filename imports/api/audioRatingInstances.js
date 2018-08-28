// audioRatingInstances.js
// Collection for storing the results of an audio rating task
// Contents:
// - task_id: ID of an AudioRatingTask
// - rating: answer to rating question
// - time_submitted: date object 

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const AudioRatingInstances = new Mongo.Collection('audioratinginstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audioratinginstances', function publish(){
        // TODOLATER: this publish function should be more selective
        // It shouldn't be a big deal for our purposes
        return AudioRatingInstances.find();
    });
}

export function createAudioRatingInstance(rating_task_id) {
    let instance_id = AudioRatingInstances.insert({
        task_id: rating_task_id,
        rating: null,
        time_submitted: null,
    });

    return instance_id;
}

Meteor.methods({
    'audioRatingInstances.submitRating'(instance_id, answer) {
        let time_submitted = new Date();
        let upd = {
            rating: answer,
            time_submitted: time_submitted,
        };

        AudioRatingInstances.update(
            {_id: instance_id},
            {$set: upd}
        );
    },

})