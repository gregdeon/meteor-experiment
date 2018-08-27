// audioInstances.js
// Collection for storing a single group transcription
// Contents:
// TODO: update these
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
import {getServerTime} from './utils.js';

import * as diff from 'diff';

export const AudioInstances = new Mongo.Collection('audioinstances', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    // Subscribe to all audio instances. Useful for admin access
    Meteor.publish('audioinstances', function publish(){
        return AudioInstances.find({});
    });    

    // Subscribe 
    Meteor.publish('audioinstances.inList', function publish(id_list){
        return AudioInstances.find({
            _id: {$in: id_list}
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

export const DIFF_STATES = {
    CORRECT: 0,
    INCORRECT: 1,
    NOT_TYPED: 2,
}

// Find the Myers diff between the ground truth and a set of words
export function diffWords(true_words, typed_words) {
    let raw_diff = diff.diffArrays(true_words, typed_words);

    let ret = []
    raw_diff.forEach(part => {
        let state = (part.removed ? DIFF_STATES.NOT_TYPED : part.added ? DIFF_STATES.INCORRECT : DIFF_STATES.CORRECT)
        part.value.forEach(word => {
            ret.push({text: word, state: state});
        })
    })

    return ret;
}

// List whether each typed word was correct or not 
// Input should be the output of diffWords
export function listTypedCorrect(words_diff) {
    let words_typed = words_diff.filter(
        word => word.state == DIFF_STATES.CORRECT || word.state == DIFF_STATES.INCORRECT
    );
    let ret = words_typed.map(word => word.state == DIFF_STATES.CORRECT);
    return ret;
}

// List whether each of the ground truth words were typed
// Input should be the output of diffWords
export function listGroundTruthTyped(words_diff) {
    let words_truth = words_diff.filter(
        word => word.state == DIFF_STATES.CORRECT || word.state == DIFF_STATES.NOT_TYPED
    );
    let ret = words_truth.map(word => word.state == DIFF_STATES.CORRECT);
    return ret;
}

// Count how many words were typed by each combination of players
// Inputs should be outputs from listGroundTruthTyped
// Output is a list of number of words typed by [0, p1, p2, p1+2, p3, p1+3, p2+3, all]
export function getNumCorrectByPlayers(typed_p1, typed_p2, typed_p3) {
    let ret = [0, 0, 0, 0, 0, 0, 0, 0];
    for(let word_idx = 0; word_idx < typed_p1.length; word_idx++) {
        let w1 = typed_p1[word_idx];
        let w2 = typed_p2[word_idx];
        let w3 = typed_p3[word_idx];

        ret[0b001] += w1;
        ret[0b010] += w2;
        ret[0b011] += w1 | w2;
        ret[0b100] += w3;
        ret[0b101] += w1 | w3;
        ret[0b110] += w2 | w3;
        ret[0b111] += w1 | w2 | w3;
    }

    return ret;
}


// Wrapper function for getResultsFromText
export function getInstanceResults(audio_instance) {
    console.log(audio_instance);
    let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task});

    let true_words = audio_task.words;
    let all_typed_words = audio_instance.words;

    return getResultsFromText(true_words, all_typed_words, audio_task.reward_mode);
}

// Get some statistics on how well the group performed
// This includes:
// - found: list of lists. found[i] is a list describing which players 
//          found word i (ex: [true, false, false] means only P1 found it)
// - typed: list. typed[i] is how many words player i+1 typed.
// - correct: list. correct[i] is how many words player i+1 typed correctly.
// - anybody_found: list of True/False for each word
// - payments: list. payments[i] is how many cents player i+1 earned.
// Note that number of errors is typed[i] - correct[i].
export function getResultsFromText(true_words, all_typed_words, reward_mode) {
    let num_words = true_words.length;
    let num_players = all_typed_words.length;

    let found = Array(num_words);
    for(let i = 0; i < num_words; i++) {
        found[i] = new Array(0);
    }
    let anybody_found = Array(num_words).fill(false);

    let typed = Array(num_players);
    let diffs = Array(num_players);

    for(let i = 0; i < num_players; i++) {
        typed[i] = new Array(0);

        let typed_words = all_typed_words[i];
        let words_diff = diff.diffArrays(true_words, typed_words);
        diffs[i] = words_diff;

        let current_word = 0;
        words_diff.map(part => {
            // Words they typed that weren't in the string
            if(part.added) {
                for(let j = 0; j < part.count; j++) {
                    typed[i].push(false)
                }
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
                for(let j = 0; j < part.count; j++) {
                    found[current_word+j].push(true);
                    anybody_found[current_word+j] = true;
                    typed[i].push(true);
                }
                current_word += part.count;
            }
        });
    }

    return {
        found: found,
        anybody_found: anybody_found,
        typed: typed,
        diffs: diffs,
        payments: getPayments(found, reward_mode),
    };
}

// Helper function for 
function getPayments(found_list, reward_mode) {
    return getRewards(found_list, reward_mode, 0);
}

// TODO: test
function normalizeWord(word) {
    let lower_case = word.toLowerCase();

    let allowed_chars = new Set("abcdefghijklmnopqrstuvwxyz0123456789 ")
    let space_chars = new Set("-")
    let normalized = '';
    for(let i = 0; i < lower_case.length; i++) {
        let c = lower_case.charAt(i);
        if(allowed_chars.has(c)) {
            normalized += c;
        }
        else if(space_chars.has(c)) {
            normalized += " ";
        }
    }
    return normalized.split(" ");
}

Meteor.methods({
    'audioInstances.recordTimeEntered'(audio_instance, date) {
        if(!audio_instance.time_entered) {
            let time_entered = date;
            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {time_entered: time_entered}}
            )
        }
    },

    'audioInstances.startTask'(audio_instance, date) {
        if(!audio_instance.time_started_task) {
            let time_started = date;
            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {time_started_task: time_started}}
            )
        }
    },

    'audioInstances.startScoreScreen'(audio_instance, date) {
        if(!audio_instance.time_started_rating) {
            let time_started = date;
            // TODO: process the instance right now
            // Need a function that produces diffs and bonuses together
            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {time_started_rating: time_started}}
            );
        }
    },

    'audioInstances.submitWord'(audio_instance, word) {
        let normalized_words = normalizeWord(word);

        AudioInstances.update(
            {_id: audio_instance._id},
            {$push: {words_typed: {$each: normalized_words}}}
        );
    },

    'audioInstances.submitRating'(instance_id, player_num, ratings) {
        // Save a timestamp in case we need it
        ratings.time_submitted = new Date(getServerTime());

        // Put it into the puzzle instance
        let upd = {};
        upd['ratings.' + player_num] = ratings;
        console.log(upd);
        AudioInstances.update(
            {_id: instance_id},
            {$set: upd}
        );
    },
});