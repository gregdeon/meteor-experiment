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

// Left-pad a number with 0s
function pad(num, digits)
{
    var ret = "" + num;
    while(ret.length < digits)
        ret = "0" + ret;
    return ret;
}

export function centsToString(cents) {
    return ("$" + Math.floor(cents/100) + "." + pad(cents%100, 2));
}

