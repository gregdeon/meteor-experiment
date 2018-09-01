// Component for viewing tutorials

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx';
import {DIFF_STATES} from '../api/audioInstances.js'

import './Tutorial.css';

// - tutorial_type: one of TutorialTypes
// - audio_path: path to an audio file
// - audio_length: length of the audio clip in seconds
// - words_truth: list of ground truth words

export class TutorialTextNextButton extends Component {
    render() {
        return <div className='tutorial-text'>
            <p>{this.props.text}</p>
            <Button variant="contained" onClick={this.props.finishedCallback}>
                {this.props.button_text}
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
            this.props.finishedCallback();
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

const audio_rating_steps = [
    {text: 'TODO'},
]


const num_steps_audio_rating = 2;

export class AudioRatingTutorial extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current_step: 0,
        };
    }

    handleNextStep() {
        this.setState({
            current_step: this.state.current_step + 1,
        });
    }

    handleSubmit(rating) {
        if(this.state.current_step === num_steps_audio_rating - 1) {
            console.log("TODO: submit tutorial and advance workflow");
        }
        else {
            console.log("error: buttons not enabled yet")
        }
    }

    // TODO: make these standalone classes
    withNextButton(text) {
        return <div className='tutorial-text'>
            <p>{text}</p>
            <Button variant="contained" onClick={this.handleNextStep.bind(this)}>
                Next
            </Button>
        </div>
    }

    withNumberQuestion(text, question_text, answer) {
        return null;
    }

    withFinishButton(text) {
        return <div className='tutorial-text'>
            <p>{text}</p>
            <Button variant="contained" onClick={this.props.finishedCallback}>
                Next
            </Button>
        </div>
    }

    renderTutorialText() {
        let number_of_words_text = "For each worker, we will show you how many words they typed and how many were correct.";

        switch(this.state.current_step) {
            case 0: 
                return this.withNextButton("At end of each of each audio clip, we will compare your transcript with 2 other previous workers. (In this example, we're showing 3 past workers.)");
            case 1:
                return this.withNumberQuestion(
                    number_of_words_text,
                    "How many words did Worker 1 type?",
                    23
                );
            case 1:
                return this.withFinishButton("TODO: this is end of tutorial");
        }
    }

    render() {
        let word_lists = [
            // P1
            [
                {text: 'these', state: DIFF_STATES.CORRECT},
                {text: 'are', state: DIFF_STATES.INCORRECT},
                {text: 'some', state: DIFF_STATES.NOT_TYPED},
                {text: 'words', state: DIFF_STATES.CORRECT}
            ],
            // P2
            [
                {text: 'this', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'a', state: DIFF_STATES.CORRECT},
                {text: 'slightly', state: DIFF_STATES.CORRECT},
                {text: 'longer', state: DIFF_STATES.CORRECT},
                {text: 'list', state: DIFF_STATES.CORRECT},
                {text: 'of', state: DIFF_STATES.CORRECT},
                {text: 'words', state: DIFF_STATES.CORRECT},
                {text: 'which', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'mostly', state: DIFF_STATES.CORRECT},
                {text: 'correct', state: DIFF_STATES.NOT_TYPED},
            ],
            // P3
            [
                {text: 'this', state: DIFF_STATES.CORRECT},
                {text: 'list', state: DIFF_STATES.CORRECT},
                {text: 'of', state: DIFF_STATES.CORRECT},
                {text: 'words', state: DIFF_STATES.CORRECT},
                {text: 'is', state: DIFF_STATES.CORRECT},
                {text: 'not', state: DIFF_STATES.CORRECT},
                {text: 'as', state: DIFF_STATES.CORRECT},
                {text: 'long', state: DIFF_STATES.CORRECT},
            ]
        ]
        return <div className='tutorial-container'>
            <h1>Tutorial</h1>
            <Paper>
                {this.renderTutorialText()}
            </Paper>
            <AudioTaskScoreScreen 
                player_num={3}
                word_lists={word_lists}
                total_pay={30}
                total_correct={61}
                rewards={[5, 10, 15]}
                submitCallback={this.handleSubmit.bind(this)}
            />
        </div>
    }
}


export class AudioTaskTutorial extends Component {
    constructor() {

    }
}

export class TutorialScreen extends Component {
    render() {

        let tutorial_items = this.props.tutorial.steps;
        return (
            <div className="tutorial-container">
            <h1>Tutorial</h1>
            <div className="tutorial-buttons">
            <button
                className="tutorial-button"
                onClick={this.startTutorial.bind(this)}
            >
                Replay Tutorial
            </button>
            <button
                className="tutorial-button"
                onClick={this.props.finishedCallback}
            >
                Ready
            </button>
            </div>
            <br />
            <div className="tutorial-inner">
                <img src={this.props.tutorial.image} />
                {tutorial_items.map((item, idx) => (
                    <TutorialItem 
                        order={idx+1}
                        key={idx+1}
                        tutorial_item={item}
                    />
                ))}
            </div>
            </div>
        );
    }
}