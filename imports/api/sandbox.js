import { Meteor } from 'meteor/meteor';

import {AudioTasks} from './audioTasks.js';
import {AudioInstances, normalizeWord} from './audioInstances.js';

// Helper function: set up a dummy audio instance
function setUpSandboxAudio() {
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
        {
            audio_task: 'test_id',
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

if (Meteor.isServer) {
    setUpSandboxAudio();

    Meteor.publish('sandbox.audiotasks', function publish(){
        return AudioTasks.find({_id: 'test_id'});
    });

    Meteor.publish('sandbox.audioinstances', function publish(){
        return AudioInstances.find({_id: 'test_id'});
    });
}

Meteor.methods({
    'sandbox.resetAudio'() {
        setUpSandboxAudio();
    },
})