import React, { Component } from 'react';

import {QuestionTypes} from '../api/surveys.js';

export class Survey extends Component {
    constructor(props) {
        super(props);

        let survey = this.props.survey;
        let num_questions = survey.questions.length;
        this.state = {
            responses: Array(num_questions).fill(null),
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
        // Submit
        Meteor.call(
            'surveys.addResponse',
            this.props.survey._id,
            this.props.workflow_instance_id,
            this.state.responses,
        );
        // Continue
        this.props.finishedCallback();
    }

    handleText(question_num, event) {
        let new_responses = this.state.responses.slice();
        new_responses[question_num] = event.target.value;
        this.setState({responses: new_responses});
    }    

    handleSelectRadio(question_num, value) {
        let new_responses = this.state.responses.slice();
        new_responses[question_num] = value;
        this.setState({responses: new_responses});
    }

    renderRequiredStar() {
        return (
            <div className="survey-required">*</div>
        );
    }

    renderTextShort(question_num) {
        let val = this.state.responses[question_num];
        val = (val === null ? "" : val);
        return (
            <input
                type="text"
                value={val}
                onChange={this.handleText.bind(this, question_num)}
            />
        );
    }

    renderTextLong(question_num) {
        let val = this.state.responses[question_num];
        val = (val === null ? "" : val);
        return (
            <textarea
                value={val}
                onInput={this.handleText.bind(this, question_num)}
            />
        );
    }

    renderMultipleChoice(question_num) {
        let question = this.props.survey.questions[question_num];
        return (
            <div className="survey-choices">
            {   
                question.options.map((option, idx) => {
                    return (
                        <div key={idx}>
                        <label>
                            <input 
                            type="radio"
                            value={idx}
                            checked={this.state.responses[question_num] === idx}
                            onChange={this.handleSelectRadio.bind(this, question_num, idx)}
                            />
                            {option}
                        </label>
                        </div>
                    );
                })
            }
            </div>
        );
    }

    renderQuestion(question_num) {
        let question = this.props.survey.questions[question_num]
        let input = null;
        switch (question.type) {
            case QuestionTypes.TEXT_SHORT:
                input = this.renderTextShort(question_num);
                break;

            case QuestionTypes.TEXT_LONG:
                input = this.renderTextLong(question_num);
                break;

            case QuestionTypes.MULTIPLE_CHOICE:
                input = this.renderMultipleChoice(question_num);
                break;
        }
        return (
            <div 
                className="survey-question"
                key={question_num}
            >
                <div className="survey-question-text">
                    <h3>{question.text}</h3>
                    {question.required ? this.renderRequiredStar() : null}
                </div>
                {input}
            </div>
        );
    }

    render () {
        let survey = this.props.survey;
        return (
            <div className="survey-container">
                <h1>{survey.title}</h1>
                <hr/>

                {survey.questions.map((question, idx) => (
                    this.renderQuestion(idx)
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

