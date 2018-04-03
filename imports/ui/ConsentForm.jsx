import React, { Component } from 'react';

import {ConsentForms} from '../api/consentForms.js';

export class ConsentForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            consent: null,
            rejected: false,
        };
    }

    handleSelectRadio(val) {
        this.setState({consent: val});
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log("Consent: " + this.state.consent);

        if(!this.state.consent) {
            this.setState({rejected: true});
        } 
        else {
            this.props.finishedCallback();
        }
    }

    renderButton(text) {
        return (
            <div className="consent-button">
                <button>{text}</button>
            </div>
        );
    }

    renderForm(lines) {
        return (
            <div className="consent-content">
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
                        checked={this.state.consent === true}
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
                        checked={this.state.consent === false}
                        onChange={this.handleSelectRadio.bind(this, false)}
                    />
                    I Do Not Consent
                </label>
                </div>
                <div className="consent-input">
                <button
                    className="consent-button"
                    type="submit"
                    disabled={this.state.consent === null}
                >
                    Submit
                </button>
                </div>
            </form>
            </div>
        );
    }

    renderRejected() {
        return (
            <p>
            We're sorry to hear that. Please close this window and return the HIT.
            </p>
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
                { this.state.rejected 
                    ? this.renderRejected() 
                    : this.renderForm(lines) 
                }
            </div>
        );
    }
}