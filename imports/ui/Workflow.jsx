import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {WorkflowStages} from '../api/workflows.js';
import {ConsentForms} from '../api/consentForms.js'

class ConsentForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            consent: false,
        };
    }

    handleSelectRadio(val) {
        this.setState({consent: val});
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log("Consent: " + this.state.consent);
    }

    renderButton(text) {
        return (
            <div className="consent-button">
                <button>{text}</button>
            </div>
        );
    }

    render() {
        console.log(this.props);
        let consent_text = this.props.consentform.text;
        let lines = consent_text.slice();
        lines.push("Thank you for considering participation in this study.");

        return (
            <div className="consent-container">
                <h1>Consent Form</h1>
                <hr/>
                {
                    lines.map((line, idx) => {
                        return <p key={idx}>{line}</p>
                    })
                }
                <hr/>
                <p key={-1}>
                    {"With full knowledge of all foregoing, I agree, of my own free will, to participate in this study:"}
                </p>
                <form
                    onSubmit={this.handleSubmit.bind(this)}
                >
                    <div className="consent-input">
                    <label>
                        <input 
                            type="radio"
                            value="true"
                            checked={!!this.state.consent}
                            onChange={this.handleSelectRadio.bind(this, true)}
                        />
                        I Consent
                    </label>
                    </div>
                    <div className="consent-input">
                    <label>
                        <input 
                            type="radio"
                            value="true"
                            checked={!this.state.consent}
                            onChange={this.handleSelectRadio.bind(this, false)}
                        />
                        I Do Not Consent
                    </label>
                    </div>
                    <div className="consent-input">
                    <button
                        className="consent-button"
                        type="submit"
                    >
                        Submit
                    </button>
                    </div>
                </form>
            </div>
        );
    }
}

export class Workflow extends Component {
    render() {
        let stage_num = this.props.workflowInstance.stage;

        let stage = this.props.workflow.stages[stage_num];

        switch(stage.type) {
            // TODO: add consent form by ID
            case WorkflowStages.CONSENT:
                console.log(stage.id);
                let consentform = ConsentForms.findOne({_id: stage.id});
                return (
                    <ConsentForm 
                        consentform={consentform}
                    />
                );

            // TODO: add other types
        }
    }
}