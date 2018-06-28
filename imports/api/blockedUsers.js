// blockedUsers.js
// Collection with a list of users that have already done this experiment
// Contents:
// - username: a username that is disallowed

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const BlockedUsers = new Mongo.Collection('blockedusers', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('blockedusers', function publish(){
        return BlockedUsers.find({});
    });
}