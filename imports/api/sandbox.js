import { Meteor } from 'meteor/meteor';

import {AudioTasks} from './audioTasks.js';
import {AudioInstances} from './audioInstances.js';

// Helper function: set up a dummy audio instance
function setUpSandboxAudio() {
    AudioTasks.upsert(
        {_id: 'test_id'},
        {
            audio_path: 'public/ambitious-01.mp3',
            audio_length: 37,
            countdown_length: 3,
            words_truth: ['this', 'is', 'a', 'bunch', 'of', 'words'],
            words_p1: ['this', 'is', 'a', 'few', 'words'],
            words_p2: ['this', 'is', 'not', 'a', 'very', 'good', 'transcript'],
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