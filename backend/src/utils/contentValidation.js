import sanitizeHtml from 'sanitize-html';

// Authoring accepts content fields only; identifiers and publishing state are
// controlled separately. Validation runs before any database mutation.
export function contentError(message) {
  const error = new Error(message);
  error.name = 'ValidationError';
  error.errors = { content: { message } };
  return error;
}

const text = (value, name, required = false) => {
  if (typeof value !== 'string' || (required && !value.trim())) {
    throw contentError(`${name} must be ${required ? 'non-empty ' : ''}text`);
  }
  return value.trim();
};
const lines = (value, name) => {
  if (!Array.isArray(value)) throw contentError(`${name} must be a list`);
  return value.map((item) => text(item, name, true));
};
const number = (value, name, minimum = 0, integer = false) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || (integer && !Number.isInteger(value))) {
    throw contentError(`${name} must be ${integer ? 'an integer' : 'a number'} of at least ${minimum}`);
  }
  return value;
};

export function lessonContent(body, creating = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw contentError('Lesson content must be an object');
  const result = {};
  for (const key of ['title', 'subject', 'gradeLevel', 'quarter', 'discussion', 'developer']) {
    if (key in body) result[key] = text(body[key], key, key === 'title');
  }
  if (creating && !result.title) throw contentError('Lesson title is required');
  for (const key of ['objectives', 'competencies', 'concepts', 'references']) {
    if (key in body) result[key] = lines(body[key], key);
  }
  if ('discussion' in result) result.discussion = sanitizeHtml(result.discussion, {
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['style'] },
    allowedStyles: { '*': { 'text-align': [/^(left|right|center|justify)$/] } },
  });
  for (const key of ['week', 'topicNumber']) {
    if (key in body) result[key] = number(body[key], key, 0, true);
  }
  if ('examples' in body) {
    if (!Array.isArray(body.examples)) throw contentError('Examples must be a list');
    result.examples = body.examples.map((example) => {
      if (!example || typeof example !== 'object') throw contentError('Each example must have a title and content');
      return {
        title: text(example.title, 'Example title', true),
        content: text(example.content, 'Example content', true),
        image: text(example.image ?? '', 'Example image'),
      };
    });
  }
  return result;
}

export function questionContent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw contentError('Question content must be an object');
  const { type } = body;
  if (!['multiple_choice', 'true_false', 'fill_blank'].includes(type)) throw contentError('Choose a supported question type');
  const result = {
    type,
    question: text(body.question, 'Question', true),
    explanation: text(body.explanation ?? '', 'Explanation'),
    points: number(body.points ?? 1, 'Points', 0.01),
    order: number(body.order ?? 0, 'Question order', 0, true),
    isPractice: body.isPractice ?? false,
    choices: [],
  };
  if (typeof result.isPractice !== 'boolean') throw contentError('isPractice must be true or false');
  if (type === 'true_false') {
    if (![true, false, 'true', 'false'].includes(body.correctAnswer)) throw contentError('Correct answer must be true or false');
    result.correctAnswer = body.correctAnswer === true || body.correctAnswer === 'true';
  } else {
    result.correctAnswer = text(String(body.correctAnswer ?? ''), 'Correct answer', true);
    if (type === 'multiple_choice') {
      result.choices = lines(body.choices, 'Choices');
      if (result.choices.length < 2 || new Set(result.choices).size !== result.choices.length) throw contentError('Provide at least two distinct choices');
      if (!result.choices.includes(result.correctAnswer)) throw contentError('Correct answer must match a choice');
    }
  }
  return result;
}
