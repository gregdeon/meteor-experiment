// errorLog.js
// Collection for logging front-end errors
// Contents:
// - user_id: reporting user's ID, if available
// - time: server time of error
// - msg, url, line, col, error: from window.error

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const ErrorLog = new Mongo.Collection('errorlog', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    Meteor.publish('errorlog', function publish(){
        return ErrorLog.find({});
    });
    ErrorLog.allow({
        'insert': function (userId, doc) {
            /* user and doc checks ,
            return true to allow insert */
            return true; 
        }
    });
}

export function submitError(msg, url, line, col, err) {
    console.log(err);
    ErrorLog.insert({
        user_id: Meteor.userId(),
        time: new Date(),
        msg: msg,
        url: url,
        line: line,
        col: col,
        error: err,
    });
}
