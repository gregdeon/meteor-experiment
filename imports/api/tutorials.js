// tutorials.js
// Collection for describing a tutorial
// Contents:
// - tutorial_type: one of TutorialTypes
// - audio_path: path to an audio file
// - audio_length: length of the audio clip in seconds
// - words_truth: list of ground truth words
// TODOLATER: make this more flexible for rating-only task

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Tutorials = new Mongo.Collection('tutorials', {
    idGeneration: 'MONGO',
});

export const TutorialTypes = {
    AUDIO_TASK: 0,
}

if (Meteor.isServer) {
    Meteor.publish('tutorials', function(){
        return Tutorials.find();
    });
}
