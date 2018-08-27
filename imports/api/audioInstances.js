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
import {getReward, getRewards} from './scoreFunctions.js';
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

// Normalize and split words 
// Convert everything to lowercase, replace "-" with " ", and remove all other punctuation 
// Returns a list of words obtained by splitting on spaces
export function normalizeWord(word) {
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

export function processResults(audio_task, audio_instance) {
    let diffs = [
        diffWords(audio_task.words_truth, audio_task.words_p1),
        diffWords(audio_task.words_truth, audio_task.words_p2),
        diffWords(audio_task.words_truth, audio_instance.words_typed),
    ]

    // Find which of the ground truth words they typed
    let typed_truth = diffs.map(diff => listGroundTruthTyped(diff));

    // Count how many words each coalition typed
    let num_typed = getNumCorrectByPlayers(...typed_truth)

    // Get bonuses
    let total_bonus = getReward(num_typed[0b111]);
    let bonuses = getRewards(num_typed, audio_task.reward_mode);

    return {
        'diffs': diffs,
        'num_correct': num_typed,
        'bonuses': bonuses,
        'total_bonus': total_bonus,
    }
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

    'audioInstances.startScoreScreen'(audio_task, audio_instance, date) {
        if(!audio_instance.time_started_rating) {
            let time_started = date;

            // Do all of the results processing now
            let results = processResults(audio_task, audio_instance)

            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {
                    diffs: results.diffs,
                    num_correct: results.num_correct,
                    total_bonus: results.total_bonus,
                    bonuses: results.bonuses,
                    time_started_rating: time_started
                }}
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