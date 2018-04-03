// workflowInstances.js
// Collection for describing a group's progress in a co-op workflow
// Contents:
// - user_ids: list of references to users
// - coop_id: reference to coop workflow
// - stage: current stage of the group

import {Meteor} from 'meteor/meteor'; 
import {Mongo} from 'meteor/mongo';

export const CoopWorkflowInstances = new Mongo.Collection('coopworkflowinstances');

if (Meteor.isServer) {
    Meteor.publish('coopworkflowinstances', function(){
        // If they're logged in, show their instances
        if(this.userId) {
            return CoopWorkflowInstances.find(
                {},
                {
                    user_ids: {
                        $elemMatch: {
                            $eq: this.userId
                        }
                    }
                }
            );
        }
        else {
            return null;
        }
    });
}
