// audioInstances.js
// Collection for storing a single group transcription
// Contents:
// - audio_task: ID of an AudioTask
// - state: current state of the group (countdown, transcribe, score screen)
// - time_started: list of times starting each of the stages
// - words: list of lists: [typed by P1, typed by P2, typed by P3]
// - bonuses: list of rewards paid (in cents)
// - ratings: list of objects like {self: 4, others: 3, time_submitted: Date.now()}

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {AudioTasks} from './audioTasks.js'
//import {getRewards} from './scoreFunctions.js';
//import {getServerTime} from './utils.js';

export const AudioInstances = new Mongo.Collection('audioinstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('audioinstances', function publish(){
        return AudioInstances.find({
            // TODO: really need to make sure we don't publish lots of these
            // If we do this, make sure admin can still see all of them
        });
    });
}

export const AudioInstanceStates = {
    WAITING: 0,
    TASK: 1,
    SCORE: 2,
    FINISHED: 3,
};

export function addAudioInstance(audio_id, num_players) {
    //let audio_task = AudioTasks.findOne({_id: audio_id});
    let num_stages = AudioInstanceStates.FINISHED;

    let time_started = Array(num_stages).fill(null);
    let words = Array(num_players).fill([]);
    let ratings = Array(num_players).fill(null);
    let bonuses = Array(num_players).fill(null);
    //let num_words = puzzle.words.length;

    let instance_id = AudioInstances.insert({
        audio_task: audio_id,
        state: AudioInstanceStates.WAITING,
        time_started: time_started,
        words: words,
        bonuses: bonuses,
        ratings: ratings,
    });

    return instance_id;
}

Meteor.methods({
    'audioInstances.submitWord'(instance_id, player_num, word) {
        // TODO: normalize word?
        let push_data = {}
        push_data['words.' + player_num] = word
        
        AudioInstances.update(
            {_id: instance_id},
            {$push: push_data}
        );

        // TODO: update match data structure
    },
});