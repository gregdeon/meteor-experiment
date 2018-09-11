// TODO: this file is copied from Tutorial.jsx. needs refactoring someday.

import React, { Component } from 'react';
import {Meteor} from 'meteor/meteor';

import Paper from '@material-ui/core/Paper';
import Snackbar from "@material-ui/core/Snackbar";

import {TutorialTextNoInput, TutorialTextNextButton, TutorialTextNumberQuestion, TutorialTextChoiceQuestion} from './TutorialUtils.jsx';

import { MySnackbarContentWrapper } from "./Snackbars.jsx";
import {AudioRatingScreen} from './AudioTaskScoreScreen.jsx';
import {normalizeWord, processResults } from '../api/audioInstances.js'

import './Tutorial.css';

const num_steps = 13;

export class AudioRatingTutorial extends Component {
    handleSubmitRating(rating) {
        if(this.props.current_step === num_steps - 1) {
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

        let team_words_text = "After the workers finished the task, we counted how many words were typed by at least one worker. Then. we gave the team a total bonus of 5 cents for every 10 words.";
        let nextStepCallback = this.props.nextStepCallback;

        switch(this.props.current_step) {
            case 0:
                return <TutorialTextNextButton
                    text={"In a previous study, we hired workers to transcribe 30 to 40 second audio clips."}
                    finishedCallback={nextStepCallback}
                />

            case 1:
                return <TutorialTextNextButton
                    text={"This was a real-time transcription task: workers were not able to pause or replay the audio. This is a dificult task, so we didn't expect their transcripts to be perfect."}
                    finishedCallback={nextStepCallback}
                />

            case 2:
                return <TutorialTextNextButton
                    text={"During this study, we will ask you to evaluate the finished transcripts from 20 different teams of 3 workers each."}
                    finishedCallback={nextStepCallback}
                />

            case 3:
                return <TutorialTextNextButton
                    text={"On this screen, we're showing you the 3 workers' transcripts. We removed all punctuation and converted the transcripts to lowercase."}
                    finishedCallback={nextStepCallback}
                />

            case 4:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type?"}
                    question_answer={41}
                    finishedCallback={nextStepCallback}
                />

            case 5:
                return <TutorialTextNumberQuestion
                    text={number_of_words_text}
                    question_text={"How many words did Worker 1 type correctly?"}
                    question_answer={40}
                    finishedCallback={nextStepCallback}
                />

            case 6:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'northeast'?"}
                    question_options={word_status_options}
                    question_answer={0}
                    finishedCallback={nextStepCallback}
                />

            case 7:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'gone'?"}
                    question_options={word_status_options}
                    question_answer={2}
                    finishedCallback={nextStepCallback}
                />

            case 8:
                return <TutorialTextChoiceQuestion
                    text={word_status_text}
                    question_text={"In Worker 2's transcript, what is the status of the word 'come'?"}
                    question_options={word_status_options}
                    question_answer={1}
                    finishedCallback={nextStepCallback}
                />

            case 9:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many words did the entire team type correctly?"}
                    question_answer={71}
                    finishedCallback={nextStepCallback}
                />

            case 10:
                return <TutorialTextNumberQuestion
                    text={team_words_text}
                    question_text={"How many cents of bonus did the entire team earn?"}
                    question_answer={35}
                    finishedCallback={nextStepCallback}
                />

            case 11:
                return <TutorialTextNumberQuestion
                    text={"Finally, we split this bonus between the three workers."}
                    question_text={"How many cents of bonus did Worker 3 earn for this audio clip?"}
                    question_answer={11}
                    finishedCallback={nextStepCallback}
                />

            case 12: 
                return <TutorialTextNoInput
                    text={"In this task, we will ask whether you think these bonuses are fair to the three workers. You may answer 'Fair', 'Neutral', or 'Unfair' by clicking one of the buttons. Do this now to continue to the next team. Thank you for participating!"}
                />

            default:
                return <TutorialTextNoInput text={"Loading next step..."}/>;
        }
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
                {this.renderTutorialText()}
            </Paper>
            <AudioRatingScreen 
                player_num={-1}
                word_lists={results.diffs}
                total_pay={results.total_bonus}
                total_correct={results.num_correct[0b111]}
                rewards={results.bonuses}
                submitCallback={this.handleSubmitRating.bind(this)}
            />
        </div>
    }

    render() {
        return this.renderRewardInterface();
    }
}

export class TutorialScreenRating extends Component {
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
        // Submit rating before moving on
        Meteor.call(            
            'audioRatingInstances.submitRating',
            this.props.audio_rating_task._id,
            rating,
            new Date(),
            this.props.workflow_instance,
        );

        this.props.finishedCallback();
    }

    handleCloseSnackbar() {
        this.setState({
            snackbar_visible: false,
        })
    }

    renderTutorialContents() {
        return <AudioRatingTutorial
            audio_task={this.props.audio_task}
            audio_instance={this.props.audio_instance}
            current_step={this.state.current_step}
            nextStepCallback={this.handleNextStep.bind(this)}
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