// audioTasks.js
// Collection for storing the contents of an audio transcription task
// Contents:
// - audio_path: path to an audio file
// - audio_length: length of the audio clip in seconds
// - words_truth: list of ground truth words
// - words_typed_p1: list of words typed by P1
// - words_typed_p2: list of words typed by P2
// - reward_mode: one of RewardModes

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {RewardModes} from './scoreFunctions.js';

export const AudioTasks = new Mongo.Collection('audiotasks', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audiotasks', function publish(){
        return AudioTasks.find();
    });
    Meteor.publish('audiotasks.id_list', function (id_list) {
        return AudioTasks.find({_id: {$in: id_list}});
    })
}
