// audioInstances.js
// Collection for storing a single group transcription
// Contents:
// - audio_task: ID of an AudioTask
// - time_entered: time when the task screen was loaded
// - time_started_task: time when "Start Clip" was clicked
// - time_started_rating: time when the rating screen was loaded
// - time_finished: time when the rating was submitted
// - words_typed: list of {word, time_typed}
// - diffs: list of lists: [P1 diff, P2 diff, P3 diff]
//   - each diff is a list of {text, state} where state describes correct/incorrect/not typed
// - num_correct: list of number of correct words by each combination of players
// - total_bonus: total amount of reward earned by the team
// - bonuses: list of [P1 bonus, P2 bonus, P3 bonus]
// - rating: fairness rating: 0 for "Unfair", 1 for "Neutral", 2 for "Fair"

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';
import {AudioTasks} from './audioTasks.js'
import {getReward, getRewards} from './scoreFunctions.js';

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

export function createAudioTaskInstance(audio_id, num_players) {
    let instance_id = AudioInstances.insert({
        audio_task: audio_id,
        // Set during tasks
        time_entered: null,
        time_started_task: null,
        time_started_rating: null,
        time_finished: null,
        words_typed: [],
        // Set at processing time
        diffs: null,
        num_correct: null,
        total_bonus: null,
        bonuses: null,
        // Set when rating submitted
        rating: null,
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
    let words_p3 = audio_instance.words_typed.map(obj => obj.word)

    let diffs = [
        diffWords(audio_task.words_truth, audio_task.words_p1),
        diffWords(audio_task.words_truth, audio_task.words_p2),
        diffWords(audio_task.words_truth, words_p3),
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

    'audioInstances.submitWord'(audio_instance, word, date) {
        let normalized_words = normalizeWord(word);
        let timestamped_words = normalized_words.map(word => 
            ({word: word, time: date})
        )

        AudioInstances.update(
            {_id: audio_instance._id},
            {$push: {words_typed: {$each: timestamped_words}}}
        );
    },

    'audioInstances.submitRating'(audio_instance, rating, date) {
        if(!audio_instance.time_finished) {
            let time_finished = date;
            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {
                    rating: rating,
                    time_finished: time_finished,
                }}
            );
        }
    },
});