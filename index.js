import TelegramApi from 'node-telegram-bot-api';
import { START_CMD, START_SURVEY_CMD } from './commands.js';
import {
  startSticker,
  startMsg,
  surveyMsg,
  endMsg,
  asnwerQuestionsMsg,
  negativeErrorMsg,
  stringErrorMsg
} from './messages.js';
import { questionsRetusher } from './questions.js';
import { token } from './config.js';
import EventEmitter from 'events';
import express from 'express';

console.log(9532953295932);

const PORT = process.env.PORT || 8666; 
const url = `https://0.0.0.0:${PORT}/`;
const bot = new TelegramApi(token);
bot.setWebHook(`${url}/photobot${token}`);

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Express is listening on port ${PORT}`);
})

app.post(`/photobot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

let questionsQueue = null;
let passedQuestions = [];
let ANSWERS_HISTORY = [];
// Used for msg "Введите адрес проекта № N" in questionsRetusher 
let projectIndexes = [];

let isUserEnteredNumOfProjects = false;

// const PHOTO_TYPES_REGEXP = new RegExp(/(\da)|(\dg)|(\dr)|(\dl)/gi);
const PHOTO_TYPE_G_REGEXP = '\\dg';
const PHOTO_TYPE_A_REGEXP = '\\da';
const PHOTO_TYPE_R_REGEXP = '\\dr';
const PHOTO_TYPE_L_REGEXP = '\\dl';
const PHOTO_TYPES_REGEXP = new RegExp(`(${PHOTO_TYPE_G_REGEXP})|(${PHOTO_TYPE_A_REGEXP})|(${PHOTO_TYPE_R_REGEXP})|(${PHOTO_TYPE_L_REGEXP})`, 'gi');

const G_VALUE = 1;
const A_VALUE = 0.5;
const R_VALUE = 0.5;
const L_VALUE = 0.25;

const SURVEY_RETUSHER_RESULTS = {
  'photo_count': 0,
  'projects_number': 0,
  'project_addresses': [],
  'project_photo_types': [],
  'photo_typeG': 0,
  'photo_typeA': 0,
  'photo_typeR': 0,
  'photo_typeLS': 0,
};


bot.on('message', async (msg, metadata) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const name = msg.chat.first_name || msg.chat.username;

  if (text === START_CMD) {
    resetData();
    await bot.sendSticker(chatId, startSticker);
    await bot.sendMessage(chatId, startMsg(name));

    return;
  }

  const isSurveyMode = ANSWERS_HISTORY.some(msg => msg.text === START_SURVEY_CMD);

  if (text === START_SURVEY_CMD) {
    resetData();

    // Need to recreate questions if user wants to replay the survey from start by typing /survey
    questionsQueue = [...questionsRetusher];
    await bot.sendMessage(chatId, asnwerQuestionsMsg);

    await nextRetusherQuestion(chatId, questionsQueue, msg, true);

    return;
  }

  if (isSurveyMode) {
    await nextRetusherQuestion(chatId, questionsQueue, msg);

    return;
  }
});

async function nextRetusherQuestion(chatId, questions, msg, firstQuestion) {
  ANSWERS_HISTORY.push(msg);

  if (questions && questions.length !== 0) {

    const surveyMsgId = ANSWERS_HISTORY.find((msg, index) => msg.text === START_SURVEY_CMD)?.message_id;
    /* 
      Wait while user entered number of projects.
      The distance from START_SURVEY_CMD msg to user input is always 3 thats why we added 3.
    */
    let projectsCount = Number(ANSWERS_HISTORY.find(msg => msg.message_id === surveyMsgId + 3)?.text);

    if (projectsCount < 0) {
      await bot.sendMessage(chatId, negativeErrorMsg);
      throw new Error('Количество проектов не может быть отрицательным');
    }

    if ((typeof projectsCount !== 'number' || isNaN(projectsCount)) && !firstQuestion) {
      await bot.sendMessage(chatId, stringErrorMsg);
      throw new Error('Количество проектов - это число, начните опрос заново /survey');
    }

    // Need to refactor it without ugly flag check
    if (projectsCount && !isUserEnteredNumOfProjects) {
      // Minus one needed because we already have two questions in our initial array.
      // So if number of projects is 2 for example we should additional questions only once.
      projectsCount--;
      isUserEnteredNumOfProjects = true;
      
      // create a new copy of array
      const additionalQuestions = [...questions.slice(0,2)];

      // last message should not be dublicated
      const lastQuestion = questions.pop();

      while (projectsCount > 0) {
        questions.push(...additionalQuestions)
        projectsCount--;
      }

      questions.push(lastQuestion);

      // Generate sequence (1,2,3...) and so on depending on the question with projectCount
      projectIndexes = Array(Math.ceil(questions.length / 2)).fill().map((el, index) => index + 1);
    }

    const currentQuestion = questions.shift();

    if (typeof currentQuestion.value === 'function') {
      await bot.sendMessage(chatId, currentQuestion.value(projectIndexes.shift()));
    } else {
      await bot.sendMessage(chatId, currentQuestion.value);
    }

    passedQuestions.push(currentQuestion);

    return;
  }

  await bot.sendMessage(chatId, endMsg);

  console.log(passedQuestions.length)
  console.log(ANSWERS_HISTORY.length)

  saveResult(passedQuestions, ANSWERS_HISTORY);

  resetData();
  
  return;
}

function saveResult(questions, answers) {
  let answersWithoutFirstCmd = answers.slice(1);

  questions.forEach((q, index) => {
    if (q.key === 'project_addresses') {
      SURVEY_RETUSHER_RESULTS[q.key].push(answersWithoutFirstCmd[index]?.text);

      return;
    }

    if (q.key === 'project_photo_types') {
      SURVEY_RETUSHER_RESULTS[q.key].push(answersWithoutFirstCmd[index]?.text);

      return;
    }

    return SURVEY_RETUSHER_RESULTS[q.key] = answersWithoutFirstCmd[index]?.text;
  });


  return processResults(SURVEY_RETUSHER_RESULTS);
}

function processResults(results) {
  const { project_photo_types } = results;
  console.log('processing begin',  results);

  project_photo_types.forEach((typesStr) => {
    let overlap = typesStr.match(PHOTO_TYPES_REGEXP).map((type) => type.toLowerCase());

    SURVEY_RETUSHER_RESULTS['photo_typeG'] =+ Number(overlap.match(PHOTO_TYPE_G_REGEXP).replace(/\D/, ''));
    SURVEY_RETUSHER_RESULTS['photo_typeA'] =+ Number(overlap.match(PHOTO_TYPE_A_REGEXP).replace(/\D/, ''));
    SURVEY_RETUSHER_RESULTS['photo_typeR'] =+ Number(overlap.match(PHOTO_TYPE_R_REGEXP).replace(/\D/, ''));
    SURVEY_RETUSHER_RESULTS['photo_typeLS'] =+ Number(overlap.match(PHOTO_TYPE_LS_REGEXP).replace(/\D/, ''));
  });

  console.log('proccess end', SURVEY_RETUSHER_RESULTS);
}

function resetData() {
  ANSWERS_HISTORY = [];
  projectIndexes = [];
  passedQuestions = [];
  isUserEnteredNumOfProjects = false;
}

