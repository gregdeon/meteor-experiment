// Component for viewing tutorials

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Paper from '@material-ui/core/Paper';
import Snackbar from "@material-ui/core/Snackbar";

import {TutorialTextNoInput, TutorialTextNextButton, TutorialTextNumberQuestion, TutorialTextChoiceQuestion} from './TutorialUtils.jsx';

import { MySnackbarContentWrapper } from "./Snackbars.jsx";
import {AudioTask} from './AudioTask.jsx';
import {AudioTaskScoreScreen} from './AudioTaskScoreScreen.jsx';
import {normalizeWord, processResults } from '../api/audioInstances.js'

import './Tutorial.css';


const TUTORIAL_STAGES = {
    AUDIO_TASK: 0,
    AUDIO_RATING: 1,
}

const num_steps_audio_task = 4;
const num_steps_audio_rating = 10;

export class AudioTaskTutorial extends Component {
    handleSubmitRating(rating) {
        if(this.props.current_step === num_steps_audio_rating - 1) {
            this.props.finishTutorialCallback(rating);
        }
        else {
            alert("Please finish the tutorial before using these buttons.");
        }
    }

    renderTutorialText(tutorial_stage) {
        let number_of_words_text = "For each worker, we will show you how many words they typed and how many were correct.";
    
        let word_status_text = "We will also show you a detailed view of their transcripts. Black words were typed correctly, red words were typed incorrectly, and grey words were not typed.";
        let word_status_options = ["Correct", "Incorrect", "Not Typed"]

        let team_words_text = "We will count how many words were typed by at least one worker. Then. we will give the team a total bonus of 5 cents for every 10 words.";
        let nextStepCallback = this.props.nextStepCallback;

        if(tutorial_stage === TUTORIAL_STAGES.AUDIO_TASK) {
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

                default:
                    return <TutorialTextNoInput text={"Loading next step..."}/>;
            }
        }
        else {    
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
                        question_answer={41}
                        finishedCallback={nextStepCallback}
                    />

                case 2:
                    return <TutorialTextNumberQuestion
                        text={number_of_words_text}
                        question_text={"How many words did Worker 1 type correctly?"}
                        question_answer={40}
                        finishedCallback={nextStepCallback}
                    />

                case 3:
                    return <TutorialTextChoiceQuestion
                        text={word_status_text}
                        question_text={"In Worker 2's transcript, what is the status of the word 'northeast'?"}
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
                        question_text={"In Worker 2's transcript, what is the status of the word 'come'?"}
                        question_options={word_status_options}
                        question_answer={1}
                        finishedCallback={nextStepCallback}
                    />

                case 6:
                    return <TutorialTextNumberQuestion
                        text={team_words_text}
                        question_text={"How many words did the entire team type?"}
                        question_answer={71}
                        finishedCallback={nextStepCallback}
                    />

                case 7:
                    return <TutorialTextNumberQuestion
                        text={team_words_text}
                        question_text={"How many cents of bonus did the entire team earn?"}
                        question_answer={35}
                        finishedCallback={nextStepCallback}
                    />

                case 8:
                    return <TutorialTextNumberQuestion
                        text={"We will split this bonus between the three workers. (Note: if you transcribe every audio clip, we can use your transcriptions in future HITs, and we will award you bonuses as well.)"}
                        question_text={"How many cents of bonus did Worker 3 earn in this round?"}
                        question_answer={11}
                        finishedCallback={nextStepCallback}
                    />

                case 9: 
                    return <TutorialTextNoInput
                        text={"Finally, we will ask whether you think these bonuses are fair to the three workers. You may answer 'Fair', 'Neutral', or 'Unfair' by clicking one of the buttons. Do this now to continue to the next audio clip. Thank you for participating!"}
                    />
            }
        }
    }

    renderTaskInterface() {
        return <div className='tutorial-container'>
            <Paper>
                {this.renderTutorialText(TUTORIAL_STAGES.AUDIO_TASK)}
            </Paper>
            <AudioTask
                audio_task={this.props.audio_task}
                audio_instance={this.props.audio_instance}
                disabled={this.props.current_step !== num_steps_audio_task - 1}
                finishedTaskCallback={this.props.nextStageCallback}
                finishedCallback={(() => console.log("This shouldn't happen"))}
            />
        </div>
    }

    renderRewardInterface() {
        let words_truth = normalizeWord('Where I live, in the great northeast of the United States, spring has finally gone full-bloom and summer’s right around the corner. When you get outside, it’s beautiful. The trees, the flowers — and of course, the lawns! Who doesn’t love a good lawn? It looks good, smells good, feels good. For a lot of people, a lawn is the perfect form of nature. Even though, let’s be honest, the lawns we like don’t actually occur in nature.');
        let words_p1 = normalizeWord('where i live in the great northeast of the united states spring has finally come. Who doesn’t love a good lawn? For a lot of people, a lawn is the perfect form of nature the lawns we like don’t actually occur');
        let words_p2 = normalizeWord('where i live in the great northeast of the united states sprng has finally come full bloom the trees the flowers who doesnt love a good lawn it looks good it smells good feels good even though lets be honest the lawns we like actually dont occur in');
        let words_p3 = normalizeWord('where i live in the united states, spring is right around the corner when you get outside the trees the flowers and the lawns who doesnt love for a lot of people a lawn is perfect lawns dont actually occur in nature');

        let audio_task = {
            words_truth: words_truth,
            words_p1: words_p1,
            words_p2: words_p2,
            reward_mode: 1,
        }

        let audio_instance = {
            words_typed: words_p3.map((word) => ({word: word, date: null})),
        };

        let results = processResults(audio_task, audio_instance)

        return <div className='tutorial-container'>
            <Paper>
                {this.renderTutorialText(TUTORIAL_STAGES.AUDIO_RATING)}
            </Paper>
            <AudioTaskScoreScreen 
                player_num={3}
                word_lists={results.diffs}
                total_pay={results.total_bonus}
                total_correct={results.num_correct[0b111]}
                rewards={results.bonuses}
                submitCallback={this.handleSubmitRating.bind(this)}
            />
        </div>
    }

    render() {
        if(!this.props.audio_instance.time_started_rating) {
            return this.renderTaskInterface();
        }
        else {
            return this.renderRewardInterface();
        }
    }
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

    handleNextStage() {
        this.setState({
            current_step: 0,
            snackbar_message: "",
            snackbar_visible: false,
        });
    }

    handleFinishTutorial(rating) {
        // Submit rating before moving on
        Meteor.call(            
            'audioInstances.submitRating',
            this.props.audio_instance,
            rating,
            new Date(),
        );

        this.props.finishedCallback();
    }

    handleCloseSnackbar() {
        this.setState({
            snackbar_visible: false,
        })
    }

    renderTutorialContents() {
        // TODOLATER: separate class for AUDIO_RATING
        return <AudioTaskTutorial
            audio_task={this.props.audio_task}
            audio_instance={this.props.audio_instance}
            current_step={this.state.current_step}
            nextStepCallback={this.handleNextStep.bind(this)}
            nextStageCallback={this.handleNextStage.bind(this)}
            finishTutorialCallback={this.handleFinishTutorial.bind(this)}
        />
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