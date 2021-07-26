import { START_SURVEY_CMD } from './commands.js';

export const startSticker = 'https://tlgrm.eu/_/stickers/7db/045/7db045b2-07f7-36f9-b986-264daaa589da/12.webp';

export const startMsg = (name) => `
  Здравствуйте, ${name}, пожалуйста, пройдите опрос по параметрам оценки. 
  \n Для этого введите команду: \n ${START_SURVEY_CMD} 
`;
export const asnwerQuestionsMsg = 'Отвечайте на приходящие вопросы';
export const surveyMsg = `Выбирайте значения 1 0 -1 для каждого из параметров`;
export const endMsg = 'Опрос завершён, спасибо!';

export const negativeErrorMsg = 'Количество проектов не может быть отрицательным, начните опрос заново /survey';
export const stringErrorMsg = 'Количество проектов - это число, начните опрос заново /survey';