
import {Meteor} from 'meteor/meteor';

// Counters for routing workflows
// Counter documents have:
// - name: the name of the counter
// - value: the next value that will be received from the counter
export const Counters = new Mongo.Collection('counters');

if (Meteor.isServer) {
    // Subscribe to this for access to Meteor.users
    Meteor.publish("allusers", function () {
        return Meteor.users.find();
    });

    Meteor.publish('counters', function(){
        return Counters.find();
    });
}

// Server-side: get the next value for counter_name. Starts at 0.
function getAndIncrementAsync(counter_name, callback) {
    Counters.rawCollection().findOneAndUpdate(
        // Selector
        {name: counter_name},
        // Update
        {
            $inc: {value: 1},
        },
        // Options
        {
            upsert: true, 
            returnOriginal: false
        },
        callback
    )
}

// Server-side: synchronous version of the counter getter
// Note: there's no reason to use this on the client side
export function getAndIncrementCounter(counter_name) {
    // Subtract 1 because we want the pre-increment value
    let ret = Meteor.wrapAsync(getAndIncrementAsync)(counter_name);
    return ret.value.value - 1;
}

// Both sides: get the next value of the counter
export function getCounter(counter_name) {
    counter = Counters.findOne({name: counter_name});
    if(counter) {
        return counter.value
    } else {
        // Error?
        return 0;
    }
}

Meteor.methods({   
    // Example of server-side counter
    'utils.incrementCounter'(counter_name) {
        if(Meteor.isServer) {
            console.log(getAndIncrementCounter(counter_name));
        }
    },
});

// Helper function: get seconds since a date
// Edge case: if date isn't truthy, return 0 seconds
export function getSecondsSince(date) {
    if(!date) {
        return 0;
    }

    let time_now = new Date();
    let elapsed_ms = Math.abs(time_now - date);
    let elapsed_s = (elapsed_ms / 1000);
    return elapsed_s;
}

// Left-pad a number with 0s
export function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
}

// 123 -> $12.34
export function centsToString(cents) {
    return ("$" + Math.floor(cents/100) + "." + pad(cents%100, 2));
}

// 123 -> 2:03
export function secondsToString(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;

    var ret = "" + mins + ":" + pad(secs, 2);
    return ret;
}