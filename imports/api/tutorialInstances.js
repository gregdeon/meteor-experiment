// tutorial_instances.js
// Data on completed tutorials
// - tutorial_id: ID of a Tutorial
// - time_entered: time when the task screen was loaded
// - time_started_task: time when "Start Clip" was clicked
// - time_started_rating: time when the rating screen was loaded
// - time_finished: time when the rating was submitted
// - words_typed: list of {word, time_typed}
// - diff: list of {text, state} where state describes correct/incorrect/not typed
// - num_correct: number of correct words
// - rating: fairness rating: 0 for "Unfair", 1 for "Neutral", 2 for "Fair"

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Tutorials = new Mongo.Collection('tutorialinstances', {
    idGeneration: 'MONGO',
});


if (Meteor.isServer) {
    Meteor.publish('tutorialinstances', function(){
        return Tutorials.find();
    });
}
