// audioRatingTasks.js
// Collection for storing the contents of an audio rating task
// Contents:
// - words_truth: list of ground truth words
// - words_typed: list of lists. words_typed[k] is words typed by player k
// - reward_mode: one of RewardModes

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const AudioRatingTasks = new Mongo.Collection('audioratingtasks', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audioratingtasks', function publish(){
        return AudioRatingTasks.find();
    });
}
