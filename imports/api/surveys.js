// surveys.js
// Collection for describing questions in a form
// Contents:
// - title: text to show on header
// - questions: list of objects with
//   - text: question text
//   - type: one of QuestionTypes
//   - options: list of options (only if type = QuestionTypes.MULTIPLE_CHOICE)
//   - required: true or false

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Surveys = new Mongo.Collection('surveys', {
    idGeneration: 'MONGO',
});

export const QuestionTypes = {
    MULTIPLE_CHOICE: 0,
    TEXT_SHORT: 1,
    TEXT_LONG: 2,
};

if (Meteor.isServer) {
    Meteor.publish('surveys', function surveyPublication(){
        return Surveys.find();
    });
}
