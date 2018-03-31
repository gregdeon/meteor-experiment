import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Puzzles = new Mongo.Collection('puzzles');

if (Meteor.isServer) {
    Meteor.publish('puzzles', function puzzlePublication(){
        return Puzzles.find();
    });
}