// Component for viewing tutorials

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Snackbar from "@material-ui/core/Snackbar";

import { MySnackbarContentWrapper } from "./Snackbars.jsx";
import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx';
import {DIFF_STATES} from '../api/audioInstances.js'

import './Tutorial.css';

// - tutorial_type: one of TutorialTypes
// - audio_path: path to an audio file
// - audio_length: length of the audio clip in seconds
// - words_truth: list of ground truth words

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
                error_message: "",
            });
            this.props.finishedCallback(
                "Correct! The answer was " + this.props.question_options[this.props.question_answer] + "."
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

export class AudioTaskTutorial extends Component {
    constructor(props) {

    }
}


const audio_rating_last_step = 10;

export class AudioRatingTutorial extends Component {
    handleSubmit(rating) {
        if(this.props.current_step === audio_rating_last_step) {
            this.props.finishTutorialCallback(rating);
        }
        else {
            alert("Please finish the tutorial before using these buttons.");
        }
    }

    renderTutorialText() {
        let number_of_words_text = "For each worker, we will show you how many words they typed and how many were correct.";

        let word_status_text = "We will also show you a detailed view of their transcripts. Black words were typed correctly, red words were typed incorrectly, and grey words were not typed.";
        let word_status_options = ["Correct", "Incorrect", "Not Typed"]

        let team_words_text = "We will count how many words were typed by at least one worker. Then. we will give the team a total bonus of 5 cents for every 10 words."
        let nextStepCallback = this.props.nextStepCallback;

        switch(this.props.current_step) {
            case 0: 
                return <TutorialTextNextButton
                    text={"At end of each of each audio clip, we will compare your transcript with 2 other previous workers. (In this example, we're showing 3 past workers.)"}
                    finishedCallback={nextStepCallback}
                />
            case 1:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />
            case 2:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type correctly?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 3:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'great'?"}
                    question_options={word_status_options}
                    question_answer={0}
                    finishedCallback={nextStepCallback}
                />

            case 4:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'gone'?"}
                    question_options={word_status_options}
                    question_answer={2}
                    finishedCallback={nextStepCallback}
                />

            case 5:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'sprg'?"}
                    question_options={word_status_options}
                    question_answer={1}
                    finishedCallback={nextStepCallback}
                />

            case 6:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many words did the entire team type?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 7:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many cents of bonus did the entire team earn?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 8:
                return <TutorialTextNumberQuestion
                    text={"We will split this bonus between the three workers. (Note: if you transcribe every audio clip, we can use your transcriptions in future HITs, and we will award you bonuses as well.)"}
                    question_text={"How many cents of bonus did Worker 3 earn in this round?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 9: 
                return <TutorialTextNextButton
                    text={"Finally, we will ask whether you think these bonuses are fair to the three workers. You may answer 'Fair', 'Neutral', or 'Unfair' by clicking one of the buttons."}
                    finishedCallback={nextStepCallback}
                />

            case 10:
                return <TutorialTextNextButton
                    text={"Click any of the rating buttons to continue to the next audio clip. Thank you for participating!"}
                    button_text={"OK"}
                    finishedCallback={function(){alert("Click one of the rating buttons at the bottom (fair/neutral/unfair) to continue.")}}
                />
        }
    }

    render() {
        // TODO: generate word lists automatically from transcripts?
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

export const TUTORIAL_TYPES = {
    AUDIO_TASK: 0,
    AUDIO_RATING: 1,
}

export class TutorialScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            current_step: 0,
            snackbar_message: "",
            snackbar_visible: false,
        };
    }

    handleNextStep(success_message) {
        this.setState({
            current_step: this.state.current_step + 1,
            snackbar_message: "",
            snackbar_visible: false,
        });

        if(success_message) {
            this.setState({
                snackbar_message: success_message,
                snackbar_visible: true,
            })
        }
    }

    handleFinishTutorial(rating) {
        // TODO: submit
        console.log(rating);
        this.props.finishedCallback();
    }

    handleCloseSnackbar() {
        this.setState({
            snackbar_visible: false,
        })
    }

    renderTutorialContents() {
        let tutorial_type = TUTORIAL_TYPES.AUDIO_RATING;
        switch(tutorial_type) {
            case TUTORIAL_TYPES.AUDIO_TASK:
                return null;

            case TUTORIAL_TYPES.AUDIO_RATING:
                return <AudioRatingTutorial
                    current_step={this.state.current_step}
                    nextStepCallback={this.handleNextStep.bind(this)}
                    finishTutorialCallback={this.handleFinishTutorial.bind(this)}
                />
        }

    }

    render() {
        return <div className="tutorial-container">
            <h1>Tutorial</h1>
            {this.renderTutorialContents()}
            <Snackbar
                open={this.state.snackbar_visible}
                autoHideDuration={2000}
                onClose={this.handleCloseSnackbar.bind(this)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
            >
                <MySnackbarContentWrapper
                    onClose={this.handleCloseSnackbar.bind(this)}
                    variant="success"
                    message={this.state.snackbar_message}
                />
            </Snackbar>
        </div>
    }
}