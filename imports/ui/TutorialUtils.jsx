import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import './Tutorial.css';

export class TutorialTextNoInput extends Component {
    render() {
        return <div className='tutorial-text'>
            <p>{this.props.text}</p>
        </div>
    }
}

export class TutorialTextNextButton extends Component {
    handleButtonClick() {
        this.props.finishedCallback("");
    }

    render() {
        return <div className='tutorial-text'>
            <p>{this.props.text}</p>
            <Button variant="contained" onClick={this.handleButtonClick.bind(this)}>
                {this.props.button_text || "Next"}
            </Button>
        </div>
    }
}

export class TutorialTextNumberQuestion extends Component {
    constructor(props) {
        super(props);

        this.state = {
            answer: "",
            error_message: "",
        };
    }

    handleTextInput(event) {
        let new_text = event.target.value
        this.setState({
            answer: new_text,
        });
    }

    handleKeyUp(event) {
        // Submit on enter
        if(event.keyCode === 13) {
            this.handleSubmit();
        }
    }

    handleSubmit() {
        let answer_number = parseInt(this.state.answer);
        if(answer_number === this.props.question_answer) {
            this.setState({
                answer: "",
                error_message: "",
            });
            this.props.finishedCallback("Correct! The answer was \"" + this.props.question_answer + "\".");
        } else {
            this.setState({
                error_message: "Incorrect - try again."
            })
        }
    }

    render() {
        return <div className='tutorial-text'>
            <p>{this.props.text}</p>
            <p><b>Question:</b> {this.props.question_text}</p>
            <input 
                type="text" 
                className="tutorial-input" 
                value={this.state.answer}
                onInput={this.handleTextInput.bind(this)} 
                onKeyUp={this.handleKeyUp.bind(this)}
            />
            <br/>
            <Button variant="contained" onClick={this.handleSubmit.bind(this)}>
                {"Submit"}
            </Button>
            <p className='tutorial-error'>{this.state.error_message}</p>
        </div>
    }
}

export class TutorialTextChoiceQuestion extends Component {
    constructor(props) {
        super(props);

        this.state = {
            answer: -1,
            error_message: "",
        };
    }

    handleAnswerSelected(option_num) {
        this.setState({
            answer: option_num,
        });
    }

    handleSubmit() {
        if(this.state.answer === this.props.question_answer) {
            this.setState({
                answer: -1,
                error_message: "",
            });
            this.props.finishedCallback(
                "Correct! The answer was \"" + this.props.question_options[this.props.question_answer] + "\"."
            );
        } else {
            this.setState({
                error_message: "Incorrect - try again."
            })
        }
    }

    render() {
        return <div className='tutorial-text'>
            <p>{this.props.text}</p>
            <p><b>Question:</b> {this.props.question_text}</p>
            <div className="survey-choices">
            {this.props.question_options.map((option, idx) => {
                return <div key={idx}>
                    <label>
                        <input 
                            type="radio"
                            value={idx}
                            checked={this.state.answer === idx}
                            onChange={this.handleAnswerSelected.bind(this, idx)}
                        />
                        {option}
                    </label>
                </div>
            })}
            </div>
            <br/>
            <Button variant="contained" onClick={this.handleSubmit.bind(this)}>
                {"Submit"}
            </Button>
            <p className='tutorial-error'>{this.state.error_message}</p>
        </div>
    }
}