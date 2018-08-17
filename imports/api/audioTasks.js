// audioTasks.js
// Collection for storing the contents of an audio transcription task
// Contents:
// - audio_path: path to an audio file
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
    // TODO: don't publish all audio tasks
    Meteor.publish('audiotasks', function publish(){
        return AudioTasks.find();
    });
}
