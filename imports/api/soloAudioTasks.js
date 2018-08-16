// soloAudioTasks.js
// Collection for storing the contents of a single-player audio transcription task
// Contents:
// - audio_path: path to an audio file
// - words: list of ground truth words
// - reward_mode: one of RewardModes
// - TODO:
//   - teammates' words

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const SoloAudioTasks = new Mongo.Collection('soloaudiotasks', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('soloaudiotasks', function publish(){
        return SoloAudioTasks.find();
    });
}
