import React, { Component } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import {ConsentForm} from './ConsentForm'

import './Sandbox.css'

function SandboxItem(props) {
    return <ExpansionPanel style={{width:"100%"}}>
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
            <SandboxItem title="Consent Form">
                <ConsentForm 
                    consentform={{
                        text: ["This is an example of a paragraph.", "This is another paragraph."]
                    }}
                    finishedCallback={function(){console.log("Finished consent form")}}
                />
            </SandboxItem>
            <SandboxItem title="Nested Example">
                <SandboxItem title="Nested Menu">
                    <div style={{width:"100%"}}>Child</div>
                </SandboxItem>
            </SandboxItem>
        </div>
    }
}