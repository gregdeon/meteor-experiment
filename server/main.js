import { Meteor } from 'meteor/meteor';

// Workflows
import {Workflows, WorkflowStages} from '../imports/api/workflows.js';
import {CoopWorkflows, CoopWorkflowStages} from '../imports/api/coopWorkflows.js';

// Other forms
import {Surveys, QuestionTypes} from '../imports/api/surveys.js';
import {ConsentForms} from '../imports/api/consentForms.js';
import {FeedbackLetters} from '../imports/api/feedbackLetters.js';

// Instances 
import {WorkflowInstances} from '../imports/api/workflowInstances.js';
import {CoopWorkflowInstances} from '../imports/api/coopWorkflowInstances.js';
import {SurveyInstances} from '../imports/api/surveyInstances.js';

// Puzzles
import {Puzzles} from '../imports/api/puzzles.js';
import {PuzzleInstances, addPuzzleInstance} from '../imports/api/puzzleInstances.js';




function addExampleWorkflow(consent_id, survey_id, coop_id, letter_id) {
    let workflow_id = Workflows.insert({
        stages: [
//            {type: WorkflowStages.CONSENT, id: consent_id},
//            {type: WorkflowStages.SURVEY, id: survey_id},
            {type: WorkflowStages.COOP, id: coop_id},
            {type: WorkflowStages.FEEDBACK, id: letter_id},
        ],
    });
}

function addExampleConsentForm() {
    let consent_id = ConsentForms.insert({
        text: [
            "This study is being conducted by Greg d'Eon, Dr. Edith Law, and Dr. Kate Larson in the School of Computer Science at the University of Waterloo, Canada. The objective of this project is to investigate how team structures and incentive schemes can affect work quality in crowdsourcing tasks that require multiple crowdworkers to cooperate. This study is funded by a NSERC-CIHR Collaborative Health Project Grant.",
            "Study Details: If you decide to participate in this study, you will be interacting with our web-based group formation, game, and reward allocation interface. Before the study, you will be given a short questionnaire regarding your demographics (age and gender). During the study, you will be placed into teams with 2 other participants. Then, your team will work together on a number of short tasks. After each task, a bonus payment will be calculated based on each team member's performance. After the study, you will be given another questionnaire regarding how you felt about your teammates and your rewards during the study.",
            "Remuneration: This task has a base payment of $2.50 and a performance-based bonus payment (as mentioned above) with a maximum value of $2.50.",
            "Withdrawal: Participation in this study is voluntary. You may decline to answer any questions that you do not wish to answer and you can withdraw your participation at any time by ceasing to answer questions or interact with the interface, without penalty or loss of remuneration. To receive remuneration please proceed to the end of the task, obtain the unique code for this HIT, and submit it.",
            "Benefits: There are no direct known or anticipated benefits to you as a result of this study. The study will benefit the academic community by contributing to a better understanding of group performance and incentives on crowdsourcing platforms.",
            "Risks: There are no known or anticipated risks from participation in this study.",
            "Confidentiality: It is important for you to know that any information that you provide will be confidential. All of the data will be summarized and no individual could be identified from these summarized results. Furthermore, the interface is programmed to collect responses alone and will not collect any information that could potentially identify you (such as machine identifiers).",
            "When information is transmitted over the internet confidentiality cannot be guaranteed. University of Waterloo practices are to turn off functions that collect machine identifiers such as IP addresses. The host of the system collecting the data (Amazon) may collect this information without our knowledge and make this accessible to us. We will not use or save this information without your consent. If you prefer not to submit your survey responses through this host, please do not sign up for this study.",
            "The data, with no personal identifiers, collected from this study will be maintained on a password-protected computer database in a restricted access area of the university and on an external Amazon EC2 server. As well, the data will be electronically archived after completion of the study and maintained for 8 years and then erased.",
            "This study has been reviewed and received ethics clearance through a University of Waterloo Research Ethics Committee (ORE# 22705). If you have questions for the Committee contact the Chief Ethics Officer, Office of Research Ethics, at 1-519-888-4567 ext. 36005 or oreceo@uwaterloo.ca.",
            "Questions: If you have any questions about this study, or if you are interested in receiving a copy of the results of the study, please contact Greg d'Eon (greg.deon@uwaterloo.ca), Edith Law (edith.law@uwaterloo.ca), or Kate Larson (kate.larson@uwaterloo.ca).",
        ],
    })

    return consent_id;
}

function addExampleSurvey() {
    let survey_id = Surveys.insert({
        title: "Pre-Study Questionnaire",
        questions: [
            {
                text: "Age",
                type: QuestionTypes.MULTIPLE_CHOICE,
                options: [
                    "Younger than 25",
                    "25 - 34",
                    "35 - 44",
                    "45 - 54",
                    "55 or older",
                ],
                required: true,
            },
            {
                text: "Gender",
                type: QuestionTypes.MULTIPLE_CHOICE,
                options: [
                    "Male", 
                    "Female", 
                    "Other",
                    "Prefer not to say",
                ],
                required: true,
            },
            {
                text: "Test",
                type: QuestionTypes.TEXT_SHORT,
                required: false,
            },
            {
                text: "Test",
                type: QuestionTypes.TEXT_LONG,
                required: false,
            },
        ],
    });

    return survey_id;
}

function addCoopWorkflow() {
    let coop_id = CoopWorkflows.insert({
        size: 3,
        stages: [
            {type: CoopWorkflowStages.LOBBY, id: null},
        ],
    });

    return coop_id;
}

function addExampleFeedbackLetter() {
    let letter_id = FeedbackLetters.insert({
        text: [
            "Dear participant,",
            "Thank you for your participation in this study titled 'Study on Cooperative Group Performance in Crowdsourcing Tasks'. As a reminder, the purpose of this study is to investigate how team structures and incentive schemes can affect work quality in crowdsourcing tasks that require multiple crowdworkers to cooperate. Please remember that any data pertaining to you as an individual participant will be kept confidential.",
            "The results and findings from this study will be shared with the research community through seminars, conferences, presentations, and journal articles. If you are interested in receiving more information about these results, or if you have any other questions or comments related to this study, please do not hesitate to contact me by email at greg.deon@uwaterloo.ca.",
            "This study has been reviewed and received ethics clearance through a University of Waterloo Research Ethics Committee (ORE# 22705). If you have questions for the Committee contact the Chief Ethics Officer, Office of Research Ethics, at 1-519-888-4567 ext. 36005 or ore-ceo@uwaterloo.ca. ",
            "Greg d'Eon (greg.deon@uwaterloo.ca)",
            "Cheriton School of Computer Science",
            "University of Waterloo",
        ],
    });

    return letter_id;
}

Meteor.startup(() => {
    Puzzles.remove({});
    PuzzleInstances.remove({});
    ConsentForms.remove({});
    Surveys.remove({});
    SurveyInstances.remove({});
    FeedbackLetters.remove({});
    Workflows.remove({});
    WorkflowInstances.remove({});
    CoopWorkflows.remove({});
    CoopWorkflowInstances.remove({});

    let puzzle = {
        letters: [
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
            "TESTPUZZLE",
        ],

        words: [
            {x: 0, y: 0, dx: 1, dy: 0, len: 4, player: 0},
            {x: 0, y: 1, dx: 1, dy: 0, len: 4, player: 0},
            {x: 4, y: 0, dx: 1, dy: 0, len: 4, player: 0},
            {x: 4, y: 1, dx: 1, dy: 0, len: 4, player: 0},
            {x: 0, y: 2, dx: 1, dy: 0, len: 4, player: 1},
            {x: 0, y: 3, dx: 1, dy: 0, len: 4, player: 1},
            {x: 4, y: 2, dx: 1, dy: 0, len: 4, player: 1},
            {x: 4, y: 3, dx: 1, dy: 0, len: 4, player: 1},
            {x: 0, y: 4, dx: 1, dy: 0, len: 4, player: 2},
            {x: 0, y: 5, dx: 1, dy: 0, len: 4, player: 2},
            {x: 4, y: 4, dx: 1, dy: 0, len: 4, player: 2},
            {x: 4, y: 5, dx: 1, dy: 0, len: 4, player: 2},
        ],
    };

    Puzzles.insert(puzzle);
    puzzle = Puzzles.findOne();
    addPuzzleInstance(puzzle._id);
    let consent_id = addExampleConsentForm();
    let survey_id = addExampleSurvey();
    let coop_id = addCoopWorkflow();
    let letter_id = addExampleFeedbackLetter();
    addExampleWorkflow(consent_id, survey_id, coop_id, letter_id);
});
