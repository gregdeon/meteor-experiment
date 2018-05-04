// tutorials.js
// Collection for describing a tutorial
// Contents:
// - image: path to a static image file
// - steps: list of steps in the tutorial:
//   - x, y, w, h: position of highlight
//   - text: popup caption text

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const Tutorials = new Mongo.Collection('tutorials', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('tutorials', function tutorialPublication(){
        return Tutorials.find();
    });
}
