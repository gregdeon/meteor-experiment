// audioRatingTasks.js
// Collection for storing the contents of an audio rating task
// Contents:
// - words_truth: list of ground truth words
// - words_typed_p1: list of words typed by player 1
// - words_typed_p2: list of words typed by player 2
// - words_typed_p3: list of words typed by player 3
// - reward_mode: one of RewardModes
// - p3_rating: original rating by player 3 for convenience
// - task_number: original task number in experiment sequence for convenience

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const AudioRatingTasks = new Mongo.Collection('audioratingtasks', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audioratingtasks', function publish(){
        return AudioRatingTasks.find();
    });
    Meteor.publish('audioratingtasks.id_list', function (id_list) {
        return AudioRatingTasks.find({_id: {$in: id_list}});
    })
}
