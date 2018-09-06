import React, { Component } from 'react';

import {QuestionTypes} from '../api/surveys.js';

export class SurveyTextShort extends Component {
    handleInput(event) {
        this.props.updateCallback(event.target.value);
    }

    render() {
       return <input
            type="text"
            value={this.props.value || ""}
            onChange={this.handleInput.bind(this)}
        /> 
    }
}

export class SurveyTextLong extends Component {
    handleInput(event) {
        this.props.updateCallback(event.target.value);
    }

    render() {
       return <textarea
            value={this.props.value || ""}
            onChange={this.handleInput.bind(this)}
        /> 
    }
}

export class SurveyMultipleChoice extends Component {
    handleInput(idx) {
        this.props.updateCallback(idx);
    }

    render() {
        return <div className="survey-choices"> {   
            this.props.options.map((option, idx) => {
                return (
                    <div key={idx}>
                    <label>
                        <input 
                            type="radio"
                            value={idx}
                            checked={this.props.value === idx}
                            onChange={this.handleInput.bind(this, idx)}
                        />
                        {option}
                    </label>
                    </div>
                );
            })
        } </div>
    }
}

export class SurveyQuestion extends Component {
    renderInput() {
        switch(this.props.type) {
            case QuestionTypes.TEXT_SHORT:
                return <SurveyTextShort
                    value={this.props.value || ""}
                    updateCallback={this.props.updateCallback}
                />

            case QuestionTypes.TEXT_LONG:
                return <SurveyTextLong
                    value={this.props.value || ""}
                    updateCallback={this.props.updateCallback}
                />
            case QuestionTypes.MULTIPLE_CHOICE:
                return <SurveyMultipleChoice
                    value={this.props.value}
                    options={this.props.options}
                    updateCallback={this.props.updateCallback}
                />
        }
    }

    render() {
        return (
            <div className="survey-question">
                <div className="survey-question-text">
                    {this.props.required ? <p className="survey-required">*</p> : null}
                    <p><b>{this.props.text}</b></p>
                </div>
                {this.renderInput()}
                <hr/>
            </div>
        );
    }
}

export class Survey extends Component {
    constructor(props) {
        super(props);

        let survey = this.props.survey;
        let num_questions = survey.questions.length;
        this.state = {
            responses: Array(num_questions).fill(null),
            time_started: new Date(),
        };
    }

    isQuestionFilled(question_num) {
        let question = this.props.survey.questions[question_num];
        let response = this.state.responses[question_num];
        switch (question.type) {
            case QuestionTypes.TEXT_SHORT:
            case QuestionTypes.TEXT_LONG:
                return (response !== null && response != '');

            case QuestionTypes.MULTIPLE_CHOICE:
                return response !== null;
        }
    }

    isFilled() {
        let questions = this.props.survey.questions;
        let num_questions = questions.length;
        for(let i = 0; i < num_questions; i++) {
            if(!questions[i].required)
                continue;

            if(!this.isQuestionFilled(i))
                return false;
        }
        return true;
    }

    handleSubmit() {
        console.log(this.state.responses);
        window.scrollTo(0, 0);

        let time_finished = new Date();

        // Submit
        Meteor.call(
            'surveys.addResponse',
            this.props.survey._id,
            this.state.responses,
            this.state.time_started,
            time_finished,
            this.props.workflow_instance,
        );
        // Continue
        this.props.finishedCallback();
    }

    handleUpdate(question_num, value) {
        console.log(question_num, value)
        let new_responses = this.state.responses.slice();
        new_responses[question_num] = value;
        this.setState({responses: new_responses});
    }

    render () {
        let survey = this.props.survey;
        return (
            <div className="survey-container">
                <h1>{survey.title}</h1>
                <hr/>

                {survey.questions.map((question, idx) => (
                    <SurveyQuestion 
                        key={idx} 
                        updateCallback={this.handleUpdate.bind(this, idx)}
                        value={this.state.responses[idx]}
                        {...question}
                    />
                ))}

                <div className="survey-submit">
                    <button
                        type="submit"
                        disabled={this.isFilled() === false}
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Submit
                    </button>
                    </div>
            </div>
        );
    }
}

