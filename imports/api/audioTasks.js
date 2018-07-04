// audioTasks.js
// Collection for storing the contents of an audio transcription task
// Contents:
// - audio_path: path to an audio file
// - words: list of ground truth words
// - reward_mode: one of RewardModes

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

import {ScoreModes, RewardModes} from './scoreFunctions.js';

export const AudioTasks = new Mongo.Collection('audiotasks', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audiotasks', function publish(){
        return AudioTasks.find();
    });
}
