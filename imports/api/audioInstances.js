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
import {getRewards} from './scoreFunctions.js';
//import {getServerTime} from './utils.js';


import * as diff from 'diff';


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

// Get some statistics on how well the group performed
// This includes:
// - found: list of lists. found[i] is a list describing which players 
//          found word i (ex: [true, false, false] means only P1 found it)
// - typed: list. typed[i] is how many words player i+1 typed.
// - correct: list. correct[i] is how many words player i+1 typed correctly.
// - payments: list. payments[i] is how many cents player i+1 earned.
// Note that number of errors is typed[i] - correct[i].
export function getInstanceResults(audio_instance) {
    console.log(audio_instance);
    let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task});

    let true_words = audio_task.words;
    let all_typed_words = audio_instance.words;

    let num_words = true_words.length;
    let num_players = all_typed_words.length;

    let correct = Array(num_players).fill(0);
    let typed = Array(num_players).fill(0);
    let found = Array(num_words);
    for(let i = 0; i < num_words; i++) {
        found[i] = new Array(0);
    }

    for(let i = 0; i < num_players; i++) {
        let typed_words = all_typed_words[i];
        let words_diff = diff.diffArrays(true_words, typed_words);

        let current_word = 0;
        words_diff.map(part => {
            // Words they typed that weren't in the string
            if(part.added) {
                typed[i] += part.count;
            }
            // Words they missed
            else if(part.removed) {
                for(let j = 0; j < part.count; j++) {
                    found[current_word+j].push(false);
                }
                current_word += part.count;
            } 
            // Words they typed correctly
            else {
                typed[i] += part.count;
                correct[i] += part.count;
                for(let j = 0; j < part.count; j++) {
                    found[current_word+j].push(true);
                }
                current_word += part.count;
            }
        });
    }

    return {
        found: found,
        typed: typed,
        correct: correct,
        payments: getPayments(found, audio_task.reward_mode),
    };
}

// Helper function for 
function getPayments(found_list, reward_mode) {
    return getRewards(found_list, reward_mode, 0);
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
    },
});