import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Paper from '@material-ui/core/Paper';

import {ConsentForm} from './ConsentForm'
import {RewardDisplay} from './RewardForm'
import {SurveyQuestion} from './Survey'
import {QuestionTypes} from '../api/surveys.js';
import {FeedbackLetter} from './FeedbackLetter'

import './Sandbox.css'

function SandboxCategory(props) {
    return <ExpansionPanel style={{width:"100%"}}>
        <ExpansionPanelSummary>
            {props.title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <Paper style={{width:"100%"}}>
                {props.children}
            </Paper>
        </ExpansionPanelDetails>
    </ExpansionPanel>
}

function SandboxItem(props) {
    return <ExpansionPanel style={{width:"100%"}} expanded={true}>
        <ExpansionPanelSummary>
            {props.title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            {props.children}
        </ExpansionPanelDetails>
    </ExpansionPanel>
}

export default class Sandbox extends Component {
    render() {
        return <div className='sandbox-container'>
            <SandboxCategory title="Reward Screen">
                <SandboxItem title="Reward display">
                    <RewardDisplay rewards={[20, 30, 50]} />
                </SandboxItem>
                <SandboxItem title="Reward display with 0">
                    <RewardDisplay rewards={[5, 0, 22]} />
                </SandboxItem>
                <SandboxItem title="Reward display with small percentages">
                    <RewardDisplay rewards={[2, 5, 50]} />
                </SandboxItem>
            </SandboxCategory>

            <SandboxCategory title="Consent Form">
                <ConsentForm 
                    consentform={{
                        text: ["This is an example of a paragraph.", "This is another paragraph."]
                    }}
                    finishedCallback={function(){console.log("Finished consent form")}}
                />
            </SandboxCategory>

            <SandboxCategory title="Survey">
                <SandboxItem title="Short text question">
                    <SurveyQuestion 
                        text="Sample question"
                        type={QuestionTypes.TEXT_SHORT}
                        updateCallback={console.log}
                    />
                </SandboxItem>                     
                <SandboxItem title="Long text question">
                    <SurveyQuestion 
                        text="Sample question with long text"
                        type={QuestionTypes.TEXT_LONG}
                        updateCallback={console.log}
                    />
                </SandboxItem>                
                <SandboxItem title="Required question">
                    <SurveyQuestion 
                        text="Sample question"
                        required={true}
                    />
                </SandboxItem>
            </SandboxCategory>

            <SandboxCategory title="Feedback Letter">
                <FeedbackLetter 
                    feedbackLetter={{
                        text: ["This is an example of a paragraph.", "This is another paragraph."]
                    }}
                    confirmCode={"ABC123"}
                />
            </SandboxCategory>

            <SandboxCategory title="Nested Example">
                <SandboxCategory title="Nested Menu">
                    <div style={{width:"100%"}}>Child</div>
                </SandboxCategory>
            </SandboxCategory>
        </div>
    }
}