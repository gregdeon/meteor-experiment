import { Meteor } from 'meteor/meteor';

import {AudioTasks} from './audioTasks.js';
import {AudioInstances, normalizeWord} from './audioInstances.js';

function getBlankAudioInstance(audio_id) {
    return {
        audio_task: audio_id,
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
    }
}

// Helper function: set up a dummy audio instance
function setUpSandboxAudio() {
    // For full audio task
    AudioTasks.upsert(
        {_id: 'test_id'},
        {
            audio_path: 'lawns-01.mp3',
            audio_length: 38,
            countdown_length: 3,
            words_truth: normalizeWord('Where I live, in the great northeast of the United States, spring has finally gone full-bloom and summer’s right around the corner. When you get outside, it’s beautiful. The trees, the flowers — and of course, the lawns! Who doesn’t love a good lawn? It looks good, smells good, feels good. For a lot of people, a lawn is the perfect form of nature. Even though, let’s be honest, the lawns we like don’t actually occur in nature.'),
            words_p1: normalizeWord('Where I live, in the great north east of the United States, sprng has finally gone full-bloom and summer’s rigt around the corner.'),
            words_p2: normalizeWord('Where I live, in the States, spring has finally gone and summer’s around. it’s beautiful. trees, flowers and the lawns!'),
            reward_mode: 0,
        }
    );

    AudioInstances.upsert(
        {_id: 'test_id'},
        getBlankAudioInstance('test_id'),
    );

    // For tutorial 
    AudioTasks.upsert(
        {_id: 'tutorial_id'},
        {
            audio_path: 'lawns-01.mp3',
            audio_length: 38,
            countdown_length: 3,
            words_truth: normalizeWord('Where I live, in the great northeast of the United States, spring has finally gone full-bloom and summer’s right around the corner. When you get outside, it’s beautiful. The trees, the flowers — and of course, the lawns! Who doesn’t love a good lawn? It looks good, smells good, feels good. For a lot of people, a lawn is the perfect form of nature. Even though, let’s be honest, the lawns we like don’t actually occur in nature.'),
            words_p1: normalizeWord(''),
            words_p2: normalizeWord(''),
            reward_mode: 0,
        }
    );

    AudioInstances.upsert(
        {_id: 'tutorial_id'},
        getBlankAudioInstance('tutorial_id'),
    );
}

// Helper function: get the sandbox audio task and instance
export function getSandboxAudio() {
    let audio_task = AudioTasks.findOne({_id: 'test_id'})
    let audio_instance = AudioInstances.findOne({_id: 'test_id'})

    return {
        task: audio_task, 
        instance: audio_instance
    };
}

export function getSandboxTutorial() {
    let audio_task = AudioTasks.findOne({_id: 'tutorial_id'})
    let audio_instance = AudioInstances.findOne({_id: 'tutorial_id'})

    return {
        task: audio_task, 
        instance: audio_instance
    };
}

if (Meteor.isServer) {
    setUpSandboxAudio();

    Meteor.publish('sandbox.audiotasks', function publish(){
        return AudioTasks.find({_id: {$in: ['test_id', 'tutorial_id']}});
    });

    Meteor.publish('sandbox.audioinstances', function publish(){
        return AudioInstances.find({_id: {$in: ['test_id', 'tutorial_id']}});
    });
}

Meteor.methods({
    'sandbox.resetAudio'() {
        setUpSandboxAudio();
    },
})