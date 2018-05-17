// Utilities for creating object instances during experiments

import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';

import {getServerTime} from './utils.js';
import {incrementCounter} from 'meteor/konecty:mongo-counter';

import {CoopWorkflows, CoopWorkflowStages} from './coopWorkflows.js';
import {CoopWorkflowInstances} from './coopWorkflowInstances.js';

import {addPuzzleInstance} from './puzzleInstances.js';

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
    return (coop_instance.user_ids.length === full_size);
}

export function initializeOutput(stage) {
    console.log(stage);
    switch(stage.type) {
        case CoopWorkflowStages.LOBBY:
            return null;

        case CoopWorkflowStages.PUZZLE:
            let puzzle_id = stage.id;
            let output_id = addPuzzleInstance(puzzle_id);
            return output_id;
    }

    return null;
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

    // Move on to the next stage in a coop workflow
    'coopworkflowinstances.advanceStage'(instance_id, current_stage) {
        let instance = CoopWorkflowInstances.findOne({_id: instance_id});
        let coop_workflow = CoopWorkflows.findOne({_id: instance.coop_id});

        let stage = instance.stage;
        let new_stage = current_stage + 1;
        let num_stages = coop_workflow.stages.length;

        if(stage === current_stage) {
            if(new_stage <= num_stages) {
                CoopWorkflowInstances.update(instance_id, {
                    $set: {stage: new_stage},
                });
            }
        }
        
        return (new_stage === num_stages);
    },

    // TODO: add skip to end
    // Set stage to final stage so that nobody else can join it
    'coopworkflowinstances.skipToEnd'(instance_id)
    {      
        CoopWorkflowInstances.update(instance_id, {
            $set: {stage: -1},
        });
    }
});
