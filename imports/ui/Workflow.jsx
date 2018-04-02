import React, { Component } from 'react';

import {ConsentForm} from './ConsentForm.jsx';
import {Survey} from './Survey.jsx';

import {WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js';
import {Surveys} from '../api/surveys.js';

export class Workflow extends Component {
    // TODO: add a "move to next stage" callback

    render() {
        console.log(this.props);
        let stage_num = this.props.workflowInstance.stage;
        let stage = this.props.workflow.stages[stage_num];

        switch(stage.type) {
            case WorkflowStages.CONSENT:
                console.log(stage.id);
                let consentform = ConsentForms.findOne({_id: stage.id});
                return (
                    <ConsentForm 
                        consentform={consentform}
                    />
                );

            case WorkflowStages.SURVEY:
                let survey = Surveys.findOne({_id: stage.id});
                return (
                    <Survey 
                        survey={survey}
                    />
                );

            case WorkflowStages.COOP:
                return (
                    <div>TODO: coop workflow</div>
                );
        }
    }
}