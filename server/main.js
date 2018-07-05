import { Meteor } from 'meteor/meteor';

// Need to import collections here so that the publish functions get run on the server side

// Workflows
import {Workflows, WorkflowStages} from '../imports/api/workflows.js';
import {CoopWorkflows, CoopWorkflowStages} from '../imports/api/coopWorkflows.js';

// Other forms
import {Surveys, QuestionTypes} from '../imports/api/surveys.js';
import {ConsentForms} from '../imports/api/consentForms.js';
import {FeedbackLetters} from '../imports/api/feedbackLetters.js';
import {Tutorials} from '../imports/api/tutorials.js';

// Instances 
import {WorkflowInstances} from '../imports/api/workflowInstances.js';
import {CoopWorkflowInstances} from '../imports/api/coopWorkflowInstances.js';
import {SurveyInstances} from '../imports/api/surveyInstances.js';

// Puzzles and audio tasks
import {Puzzles} from '../imports/api/puzzles.js';
import {PuzzleInstances} from '../imports/api/puzzleInstances.js';
import {AudioTasks} from '../imports/api/audioTasks.js';
import {AudioInstances} from '../imports/api/audioInstances.js';
import {AudioRatingTasks} from '../imports/api/audioRatingTasks.js';
import {ScoreModes, RewardModes} from '../imports/api/scoreFunctions.js';

import {RoutingCounter, updateInstances} from '../imports/api/routing.js';

import {BlockedUsers} from '../imports/api/blockedUsers.js';
import {ErrorLog} from '../imports/api/errorLog.js';

Meteor.startup(() => {
    console.log("Starting server");
    Meteor.setInterval(updateInstances, 800);
});
