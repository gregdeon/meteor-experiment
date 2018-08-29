import chai from 'chai'
let expect = chai.expect

import {WorkflowStages} from './workflows.js'
import {makeNewWorkflowInstance, getWorkflowProgress} from './workflowInstances.js';

describe('workflowInstances', function() {
    let workflow;
    let workflow_instance;

    beforeEach(function(){
        workflow = {
            _id: 'example_id',
            number: 0,
            stages: [
                {type: WorkflowStages.CONSENT, id: null},
                {type: WorkflowStages.SURVEY, id: null},
                {type: WorkflowStages.TUTORIAL, id: null},
                {type: WorkflowStages.AUDIO_TASK, id: null},
                {type: WorkflowStages.AUDIO_RATING, id: null},
                {type: WorkflowStages.FEEDBACK, id: null},
            ]
        }

        workflow_instance = {
            todo: 'yes'
        }
    })

    describe('makeNewWorkflowInstance', function() {
        let new_workflow_instance = makeNewWorkflowInstance(workflow);
    })

    describe('getWorkflowProgress', function() {

    })
})
