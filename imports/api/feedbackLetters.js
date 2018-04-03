// feedbackLetters.js
// Collection for describing a feedback letter
// Contents:
// - text: list of consent form paragraphs as strings

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const FeedbackLetters = new Mongo.Collection('feedbackletters');

if (Meteor.isServer) {
    Meteor.publish('feedbackletters', function feedbackLetterPublication(){
        return FeedbackLetters.find();
    });
}
