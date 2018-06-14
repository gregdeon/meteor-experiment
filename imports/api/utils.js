// Timing
export const ServerTime = new Mongo.Collection('servertime', {
    idGeneration: 'MONGO',
});

if (Meteor.isServer) {
    ServerTime.remove({});
    ServerTime.insert({date: new Date()});
    Meteor.publish('servertime', function serverTimePublication(){
        return ServerTime.find({});
    });
    Meteor.setInterval(updateServerTime, 200);
}

function updateServerTime() {
    let old_time = ServerTime.findOne({});
    ServerTime.update(
        {_id: old_time._id},
        {
            $set: {
                date: new Date(),
            }
        }
    )
}

export function getServerTime() {
    let date = ServerTime.findOne({}).date;
    return date;
}

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
function pad(num, digits)
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