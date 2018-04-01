import React, { Component } from 'react';
import {withTracker} from 'meteor/react-meteor-data';
import {Puzzles} from '../api/puzzles.js';
import {PuzzleInstances} from '../api/puzzleInstances.js';
import {WordSearchPuzzle} from './WordSearchPuzzle.jsx';

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
        let consent_text = [
            "Consent form goes here",
            "Another line here",
        ];

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

class App extends Component {
    render() {
        if(!this.props.ready) {
            return (
                <div>Loading...</div>
            );
        }

        return (
            <div>
                <ConsentForm />
                <WordSearchPuzzle 
                    ready={this.props.ready}
                    puzzle={this.props.puzzle}
                    puzzleinstance={this.props.puzzleinstance}
                />
            </div>

        );
    }
}

export default withTracker(() => {
    const sub = [
        Meteor.subscribe('puzzles'),
        Meteor.subscribe('puzzleinstances'),
    ];
    let all_ready = true;
    sub.map((sub_item) => {
        if(!sub_item.ready())
            all_ready = false;
    });

    return {
        ready: all_ready,
        puzzle: Puzzles.findOne(),
        puzzleinstance: PuzzleInstances.findOne(),
    };
})(App);
