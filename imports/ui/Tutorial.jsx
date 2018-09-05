// Component for viewing tutorials

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Paper from '@material-ui/core/Paper';
import Snackbar from "@material-ui/core/Snackbar";

import {TutorialTextNoInput, TutorialTextNextButton, TutorialTextNumberQuestion, TutorialTextChoiceQuestion} from './TutorialUtils.jsx';

import { MySnackbarContentWrapper } from "./Snackbars.jsx";
import {AudioTask} from './AudioTask.jsx';
import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx';
import {DIFF_STATES} from '../api/audioInstances.js'

import './Tutorial.css';


const audio_rating_last_step = 14;

export class AudioTaskTutorial extends Component {
    handleSubmitRating(rating) {
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

        let team_words_text = "We will count how many words were typed by at least one worker. Then. we will give the team a total bonus of 5 cents for every 10 words.";
        let nextStepCallback = this.props.nextStepCallback;


        switch(this.props.current_step) {
            case 0:
                return <TutorialTextNextButton
                    text={"During this study, you will transcribe 15 audio clips (30 to 40 seconds per clip)."}
                    finishedCallback={nextStepCallback}
                />

            case 1:
                return <TutorialTextNextButton
                    text={"This is a real-time transcription task: you will not be able to pause or replay the audio. It's okay if you miss words or make mistakes; we don't expect your transcriptions to be perfect."}
                    finishedCallback={nextStepCallback}
                />

            case 2:
                return <TutorialTextNextButton
                    text={"We will remove all punctuation and convert your transcript to lowercase."}
                    finishedCallback={nextStepCallback}
                />

            case 3:
                return <TutorialTextNoInput
                    text={"Transcribe the first audio clip now. We will use this first round to measure your initial skill level. Click the \"Start Clip\" button to begin."}
                />

            case 4: 
                return <TutorialTextNextButton
                    text={"At end of each of each audio clip, we will compare your transcript with 2 other previous workers. (In this example, we're showing 3 past workers.)"}
                    finishedCallback={nextStepCallback}
                />

            case 5:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 6:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type correctly?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 7:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'great'?"}
                    question_options={word_status_options}
                    question_answer={0}
                    finishedCallback={nextStepCallback}
                />

            case 8:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'gone'?"}
                    question_options={word_status_options}
                    question_answer={2}
                    finishedCallback={nextStepCallback}
                />

            case 9:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'sprg'?"}
                    question_options={word_status_options}
                    question_answer={1}
                    finishedCallback={nextStepCallback}
                />

            case 10:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many words did the entire team type?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 11:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many cents of bonus did the entire team earn?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 12:
                return <TutorialTextNumberQuestion
                    text={"We will split this bonus between the three workers. (Note: if you transcribe every audio clip, we can use your transcriptions in future HITs, and we will award you bonuses as well.)"}
                    question_text={"How many cents of bonus did Worker 3 earn in this round?"}
                    question_answer={123}
                    finishedCallback={nextStepCallback}
                />

            case 13: 
                return <TutorialTextNextButton
                    text={"Finally, we will ask whether you think these bonuses are fair to the three workers. You may answer 'Fair', 'Neutral', or 'Unfair' by clicking one of the buttons."}
                    finishedCallback={nextStepCallback}
                />

            case 14:
                return <TutorialTextNoInput
                    text={"Click any of the rating buttons to continue to the next audio clip. Thank you for participating!"}
                />

            default:
                return null;
        }
    }

    renderTaskInterface() {
        let nextStepCallback = this.props.nextStepCallback;
        return <div className='tutorial-container'>
            <Paper>
                {this.renderTutorialText()}
            </Paper>
            <AudioTask
                audio_task={this.props.audio_task}
                audio_instance={this.props.audio_instance}
                enabled={this.props.current_step === 3}
                finishedTaskCallback={nextStepCallback}
                finishedCallback={(() => console.log("This shouldn't happen"))}
            />
        </div>
    }

    renderRewardInterface() {
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
                submitCallback={this.handleSubmitRating.bind(this)}
            />
        </div>
    }

    render() {
        if(this.props.current_step <= 3) {
            return this.renderTaskInterface();
        }
        else {
            return this.renderRewardInterface();
        }
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
        // TODO: submit rating to database
        console.log(rating);
        this.props.finishedCallback();
    }

    handleCloseSnackbar() {
        this.setState({
            snackbar_visible: false,
        })
    }

    renderTutorialContents() {
        switch(this.props.tutorial_type) {
            case TUTORIAL_TYPES.AUDIO_TASK:
                return <AudioTaskTutorial
                    audio_task={this.props.audio_task}
                    audio_instance={this.props.audio_instance}
                    current_step={this.state.current_step}
                    nextStepCallback={this.handleNextStep.bind(this)}
                    finishTutorialCallback={this.handleFinishTutorial.bind(this)}
                />

            case TUTORIAL_TYPES.AUDIO_RATING:
                // TODOLATER: rating-only tutorial
                return null;

            default:
                return null;
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