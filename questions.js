export const questionsNumberable = [
  {
    question: '"Количество фотографий типа G"',
    key: 'photo_typeG',
  },
  {
    question: '"Количество фотографий типа A"',
    key: 'photo_typeA',
  },
  {
    question: '"Количество фотографий типа R"',
    key: 'photo_typeR',
  },
  {
    question: '"Количество фотографий типа Lifestyle"',
    key: 'photo_typeLS',
  }
];

export const questionsSelectable = [
  {
    question: '"Корректное экспонирование"',
    key: 'correct_expo',
  },
  {
    question: '"Корректное выделение"',
    key: 'correct_excretion',
  },
  {
    question: '"Чистота картинки"',
    key: 'picture_cleanliness',
  },
  {
    question: '"Общий цветовой баланс всех фотографий"',
    key: 'photo_balance',
  }
];

export let questionsRetusher = [
  {
    value: 'Количество проектов, над которыми сегодня работали?',
    key: 'projects_number',
  },
  {
    value: function (num) {
      return `Введите адрес проекта № ${num}`
    },
    key: 'project_addresses'
  },
  {
    value: 'Введите количество фотографий одной строкой в формате (4A 19G 4R 3L)',
    key: 'project_photo_types'
  },
  {
    value: 'Введите ссылку (Dropbox) на выполненные за день проекты',
    key: 'project_link',
    isLast: true
  }
]