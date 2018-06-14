// Utilities for creating object instances during experiments

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

import {getServerTime, getSecondsSince} from './utils.js';
import {incrementCounter} from 'meteor/konecty:mongo-counter';

import {WorkflowInstances} from './workflowInstances.js';
import {CoopWorkflows, CoopWorkflowStages} from './coopWorkflows.js';
import {CoopWorkflowInstances} from './coopWorkflowInstances.js';

import {addPuzzleInstance} from './puzzleInstances.js';
import {AudioInstances, addAudioInstance, AudioInstanceStates} from './audioInstances.js';
import {AudioTasks} from './audioTasks.js';

// Helper counter to track how many coop instances we've made
/*
export const RoutingCounter = new Mongo.Collection('routingcounter', {
    idGeneration: 'MONGO',
});

const doAutoIncrement = function(collection, callback) {
    let result = collection.rawCollection().findAndModify(
        {_id: "autoincrement",}, 
        [], 
        {
            $inc: {
                value: 1
            }
        }, 
        {'new': true},
        callback
    );
}

*/
Counters = new Mongo.Collection('counters');
const getRoutingCounter = function() {
    return incrementCounter(Counters, 'coop_instances')
}



export function isFull(coop_instance) {
    let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id});
    let full_size = coop_workflow.size;
    return (coop_instance.user_ids.length >= full_size);
}

export function initializeOutput(stage) {
    console.log(stage);
    let output_id = null;
    switch(stage.type) {
        case CoopWorkflowStages.LOBBY:
            // Nothing to do here
            break;

        case CoopWorkflowStages.PUZZLE:
            let puzzle_id = stage.id;
            output_id = addPuzzleInstance(puzzle_id);
            break;

        case CoopWorkflowStages.AUDIO:
            let audio_id = stage.id;
            output_id = addAudioInstance(audio_id);
            break;
    }

    return output_id;
}

// Iterate through all coop instances
// Check for lobby status, stage times, etc
export function updateInstances() {
    //console.log("Updating instances");
    // Safety check
    if(!Meteor.isServer) {
        console.log("Warning: updateInstances() called from client (no effect)")
        return;
    }

    // Naive approach: fetch all coop instances
    // TODO: only update the ones that are active
    let coop_instances = CoopWorkflowInstances.find().fetch();
    for(let i = 0; i < coop_instances.length; i++){
        updateCoopInstance(coop_instances[i]);
    }
}


// Update a single coop instance
function updateCoopInstance(coop_instance) {
    //console.log(coop_instance.coop_id);
    // Get the coop workflow
    let coop_workflow = CoopWorkflows.findOne({_id: coop_instance.coop_id});

    // If we're done, don't bother
    let stage_num = coop_instance.stage;
    if(stage_num >= coop_workflow.stages.length) 
        return;

    // Find which stage we're on
    let stage = coop_workflow.stages[stage_num];

    // Check if we need to update the individual workflows too
    let new_stage = stage_num;

    // Find which stage we should go to
    switch(stage.type) {
        case CoopWorkflowStages.LOBBY:
            new_stage = updateCoopLobby(coop_instance);
            break;

        case CoopWorkflowStages.PUZZLE:
            // TODO
            break;

        case CoopWorkflowStages.AUDIO:
            new_stage = updateCoopAudio(coop_instance);
            break;

        default:
            console.log("Warning: unrecognized stage type in updateCoopInstance: " + stage.type)
    }

    // Actually update the stage
    if(new_stage !== stage) {
        CoopWorkflowInstances.update(
            {_id: coop_instance._id},
            {$set: {stage: new_stage}}
        );
    }

    // Update the individual workflows if we need to
    if(new_stage === -1 || new_stage >= coop_workflow.stages.length) {
        //updateIndividualWorkflows(coop_instance, new_stage);
    }
}

function updateCoopLobby(coop_instance) {
    // Move to next stage if lobby is done
    if(isFull(coop_instance)) {
        return coop_instance.stage + 1;
    }

    // Find how long is left on the lobby
    let time_now = new Date();
    let elapsed_ms = Math.abs(time_now - time_started);
    let elapsed_s = (diff_ms / 1000);
    let lobby_s = coop_instance.lobby_time * 60;
    let seconds_left = lobby_s - elapsed_s;

    // If countdown is done, skip to the end
    if(seconds_left <= 0) {    
        return -1;
    }

    return coop_instance.stage;
}

function updateCoopAudio(coop_instance) {
    // Find our audio instance
    let coop_stage = coop_instance.stage;
    let audio_id = coop_instance.output[coop_stage];
    let audio_instance = AudioInstances.findOne({_id: audio_id});
    let audio_task = AudioTasks.findOne({_id: audio_instance.audio_task});

    let audio_stage = audio_instance.state;
    let new_stage = audio_stage;

    let time_started = audio_instance.time_started[audio_stage];

    // If we need to start a timer, start it
    if(!time_started) {
        time_started = new Date();
        let upd = {};
        upd["time_started." + String(audio_stage)] = time_started;
        AudioInstances.update(
            {_id: audio_instance._id},
            {$set: upd}
        )
    }

    // If time is up, move on
    let time_s = getSecondsSince(time_started);
    let time_left = audio_task.time_s[audio_stage] - time_s;
    console.log(time_left);
    if(time_left < 0) {
        new_stage = audio_stage + 1;
        AudioInstances.update(
            {_id: audio_instance._id},
            {$set: {state: new_stage}}
        );
    }

    // If all ratings are in, also move
    else {
        let ratings = audio_instance.ratings
        if(ratings.every(rating => rating !== null)) {        
            new_stage = audio_stage + 1;
            AudioInstances.update(
                {_id: audio_instance._id},
                {$set: {state: new_stage}}
            );
        }
    }

    // If we're at the end, move on
    if(new_stage >= AudioInstanceStates.FINISHED) {
        return coop_stage + 1;
    }
    else {
        return coop_stage;
    }
}

function updateIndividualWorkflows(coop_instance, update_type) {
    user_ids = coop_instance.user_ids;

    for(let i = 0; i < user_ids.length; i++) {
        // TODO: this assumes that every user only has one instance
        // TODO: find workflow instance for this user
        // Update its stage according to the update type
        if(update_type == WorkflowUpdates.CHECK_NEXT) {
            // TODO: if we're at the end, move to next stage
            // Probably re-fetch here
        }
        else if(update_type == WorkflowUpdates.FINAL) {
            // TODO: skip to the end
        }
    }
}


Meteor.methods({
    // Join a coop workflow
    'coopworkflowinstances.setUpWorkflow'() {
        let user_id = this.userId;

        // DEBUG
        console.log("Making coop workflow instance for " + user_id);

        // Try to find an instance for them
        let coop_instance = CoopWorkflowInstances.findOne(
            {
                user_ids: [user_id],
            },
        );

        // They have one, so don't join a new one
        if(coop_instance) {
            return;
        }

        // Join an existing group or make a new one
        let upsert_output = CoopWorkflowInstances.upsert(
            // Query
            {
                // TODO: make this work for any number of players
                'user_ids.2': {$exists: false},
                stage: 0,
            },
            // Update/insert
            {
                $setOnInsert: {
                    ready: false,
                    time_started: new Date(getServerTime()),
                },
                $push: {
                    user_ids: user_id,
                },
            },
        );
        console.log("Upsert output:");
        console.log(upsert_output);

        // If we made the group...
        if(upsert_output.insertedId) {
            coop_instance_id = upsert_output.insertedId

            // Find the coop workflow that they should use
            // NOTE: because this can take a while, don't depend on this output
            // existing in the UI!
            let coop_workflows = CoopWorkflows.find().fetch();
            let coop_count = coop_workflows.length;
            let coop_num = getRoutingCounter() % coop_count;
            let coop_workflow = coop_workflows[coop_num]
            let coop_id = coop_workflow._id

            // Pick a coop workflow
            CoopWorkflowInstances.update(
                {_id: coop_instance_id},
                {
                    $set: {
                        coop_id: coop_id,
                    }
                }
            )

            // Also initialize our group's outputs
            coop_workflow.stages.map((stage, idx) => {
                let output_id = initializeOutput(stage);
                console.log(CoopWorkflowInstances.update(
                    {_id: coop_instance_id},
                    {$push: {
                        output: output_id,
                    }},
                ));
            });

            // Finally, mark as ready
            CoopWorkflowInstances.update(
                {_id: coop_instance_id},
                {$set: {ready: true}},
            );
        }
    },
});
