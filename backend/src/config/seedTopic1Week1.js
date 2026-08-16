import { seedModuleWithActivities } from './seedHelper.js';

/**
 * Week 1, Topic 1.
 *
 *   Topic 1: Represent series using sigma notation and vice versa.
 *
 * Topic 2 (percentage change) is the other Week 1 topic; it has its own module.
 */

const moduleData = {
  title:      'Week 1 · Topic 1 — Sigma Notation and Series',
  subject:    'Mathematics',
  gradeLevel: 'Grade 11',
  quarter:    'Q1',

  objectives: [
    'Identify the index, lower limit, upper limit and general term of a sigma expression.',
    'Expand a sigma expression into a series and evaluate its sum.',
    'Write a given series in sigma (Σ) notation.',
    'Evaluate sigma expressions whose lower limit is not 1, or whose general term is a constant.',
  ],

  competencies: [
    'Represent series using sigma notation and vice versa.',
  ],

  discussion: `
<h3>Panel 1 — The Long Way</h3>
<p><strong>Miguel:</strong> Ma'am, our seatwork says to add 3 + 6 + 9 + 12 + 15. Do I really have to write every term?</p>
<p><strong>Teacher:</strong> You can — but mathematicians got tired of writing long sums too. So they invented a shortcut called <em>sigma notation</em>.</p>

<h3>Panel 2 — Meet Sigma</h3>
<p><strong>Teacher:</strong> The Greek capital letter <strong>Σ</strong> (sigma) means "add all of these up." We write:</p>
<p style="text-align:center"><strong>Σ</strong> from <strong>i = 1</strong> to <strong>5</strong> of <strong>3i</strong></p>
<p><strong>Teacher:</strong> Read it as: "the sum of 3i, as i goes from 1 to 5." Four parts matter — the <strong>index</strong> (i), the <strong>lower limit</strong> (where i starts), the <strong>upper limit</strong> (where i stops), and the <strong>general term</strong> (the expression after Σ).</p>

<h3>Panel 3 — Expanding It Back</h3>
<p><strong>Miguel:</strong> So how do I turn it back into a normal sum?</p>
<p><strong>Teacher:</strong> Substitute each value of i, one at a time, then add:</p>
<p>i = 1 → 3(1) = 3<br/>
i = 2 → 3(2) = 6<br/>
i = 3 → 3(3) = 9<br/>
i = 4 → 3(4) = 12<br/>
i = 5 → 3(5) = 15</p>
<p>3 + 6 + 9 + 12 + 15 = <strong>45</strong></p>

<h3>Panel 4 — Going the Other Way</h3>
<p><strong>Teacher:</strong> Now reverse it. Given 1 + 4 + 9 + 16 + 25, ask: what pattern makes each term? Those are 1², 2², 3², 4², 5². There are 5 terms, so the general term is i² and i runs from 1 to 5:</p>
<p style="text-align:center"><strong>Σ</strong> from <strong>i = 1</strong> to <strong>5</strong> of <strong>i²</strong></p>
<p><strong>Teacher:</strong> Two questions get you there every time: <em>what rule makes each term?</em> and <em>how many terms are there?</em> The first gives the general term, the second gives the upper limit.</p>

<h3>Panel 5 — Two Traps</h3>
<p><strong>Trap 1 — a constant general term.</strong> If there is no i in the expression at all, like Σ from i = 1 to 6 of 4, then nothing changes as i moves. You simply add that constant once for every value of i:</p>
<p>4 + 4 + 4 + 4 + 4 + 4 = 4 × 6 = <strong>24</strong></p>
<p><strong>Trap 2 — the lower limit is not always 1.</strong> In Σ from i = 2 to 5 of i, the index starts at 2:</p>
<p>2 + 3 + 4 + 5 = <strong>14</strong></p>
<p><strong>Ana:</strong> So I should always check where i starts, not assume it starts at 1.</p>
<p><strong>Teacher:</strong> Exactly. And to count the terms: upper limit − lower limit + 1. Here, 5 − 2 + 1 = 4 terms.</p>

<h3>Panel 6 — Any Letter Will Do</h3>
<p><strong>Miguel:</strong> Sometimes I see k or n instead of i.</p>
<p><strong>Teacher:</strong> The index letter does not change the answer — it is just a placeholder. Σ from i = 1 to 3 of i and Σ from k = 1 to 3 of k are the same sum: 1 + 2 + 3 = 6. Substitute carefully and the letter never matters.</p>
`.trim(),

  concepts: [
    'Σ (sigma) notation is shorthand for a sum: Σ from i = 1 to n of aᵢ means a₁ + a₂ + … + aₙ.',
    'A sigma expression has four parts: the index, the lower limit, the upper limit, and the general term.',
    'To expand sigma notation, substitute each value of the index in turn and add the results.',
    'To write a series in sigma notation, find the rule that produces each term, then set the limits to match the number of terms.',
    'If the general term contains no index, the constant is added once per value of the index: Σ from i = 1 to n of c = c × n.',
    'The lower limit is not always 1 — always check where the index starts.',
    'The number of terms is (upper limit − lower limit + 1).',
    'The index letter (i, k, n) is only a placeholder and does not change the sum.',
  ],

  examples: [
    {
      title: 'Example 1 — Expanding sigma notation',
      content:
        'Evaluate Σ from i = 1 to 5 of 3i.\n\n' +
        'Substitute each value of i:\n' +
        '  i = 1 → 3(1) = 3\n' +
        '  i = 2 → 3(2) = 6\n' +
        '  i = 3 → 3(3) = 9\n' +
        '  i = 4 → 3(4) = 12\n' +
        '  i = 5 → 3(5) = 15\n\n' +
        'Add the terms: 3 + 6 + 9 + 12 + 15 = 45.\n\n' +
        'Answer: 45',
      image: '',
    },
    {
      title: 'Example 2 — Writing a series in sigma notation',
      content:
        'Write 1 + 4 + 9 + 16 + 25 using sigma notation.\n\n' +
        'Each term is a perfect square: 1², 2², 3², 4², 5².\n' +
        'So the general term is i², and there are 5 terms, so i runs from 1 to 5.\n\n' +
        'Answer: Σ from i = 1 to 5 of i²',
      image: '',
    },
    {
      title: 'Example 3 — A constant general term',
      content:
        'Evaluate Σ from i = 1 to 6 of 4.\n\n' +
        'The expression 4 does not contain i, so the value never changes:\n' +
        '  4 + 4 + 4 + 4 + 4 + 4\n\n' +
        'There are 6 values of i, so this is 4 × 6 = 24.\n\n' +
        'Answer: 24',
      image: '',
    },
    {
      title: 'Example 4 — A lower limit that is not 1',
      content:
        'Evaluate Σ from i = 2 to 5 of i.\n\n' +
        'The index starts at 2, not 1:\n' +
        '  i = 2 → 2\n' +
        '  i = 3 → 3\n' +
        '  i = 4 → 4\n' +
        '  i = 5 → 5\n\n' +
        'Sum = 2 + 3 + 4 + 5 = 14.\n' +
        'Number of terms = 5 − 2 + 1 = 4.\n\n' +
        'Answer: 14',
      image: '',
    },
  ],

  developer:  'Jovanny De Leon',
  references: [
    'Department of Education. (2016). K to 12 Most Essential Learning Competencies in Mathematics.',
    'Oronce, O. A., & Mendoza, M. O. (2016). E-Math: Worktext in Mathematics. Rex Book Store.',
  ],
  isPublished: true,
};

const practiceActivities = [
  {
    type: 'multiple_choice',
    question: 'Expand and evaluate: Σ from i = 1 to 4 of i',
    choices: ['6', '10', '12', '16'],
    correctAnswer: '10',
    explanation: 'Substitute i = 1, 2, 3, 4 and add: 1 + 2 + 3 + 4 = 10.',
    order: 1,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from i = 1 to 5 of 2i. (Enter the number only.)',
    choices: [],
    correctAnswer: '30',
    explanation: '2(1) + 2(2) + 2(3) + 2(4) + 2(5) = 2 + 4 + 6 + 8 + 10 = 30.',
    order: 2,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from i = 1 to 3 of (i + 1). (Enter the number only.)',
    choices: [],
    correctAnswer: '9',
    explanation: '(1 + 1) + (2 + 1) + (3 + 1) = 2 + 3 + 4 = 9.',
    order: 3,
  },
  {
    type: 'true_false',
    question: 'In the expression Σ from i = 1 to 5 of 3i, the number 5 is the upper limit.',
    choices: [],
    correctAnswer: true,
    explanation:
      'The upper limit is the value where the index stops. Here i runs from 1 up to 5, so 5 is ' +
      'the upper limit and the statement is true.',
    order: 4,
  },
];

const gradedActivities = [
  {
    type: 'multiple_choice',
    question: 'Evaluate Σ from i = 1 to 4 of (2i + 1)',
    choices: ['20', '22', '24', '26'],
    correctAnswer: '24',
    explanation:
      'Substitute each value of i: 2(1)+1 = 3, 2(2)+1 = 5, 2(3)+1 = 7, 2(4)+1 = 9. ' +
      'Sum = 3 + 5 + 7 + 9 = 24.',
    order: 1,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from n = 1 to 5 of n². (Enter the number only.)',
    choices: [],
    correctAnswer: '55',
    explanation: '1² + 2² + 3² + 4² + 5² = 1 + 4 + 9 + 16 + 25 = 55.',
    order: 2,
  },
  {
    type: 'multiple_choice',
    question: 'Which sigma notation represents the series 5 + 10 + 15 + 20?',
    choices: [
      'Σ from i = 1 to 4 of 5i',
      'Σ from i = 1 to 5 of 5i',
      'Σ from i = 1 to 4 of (i + 5)',
      'Σ from i = 1 to 4 of 5\u2071',
    ],
    correctAnswer: 'Σ from i = 1 to 4 of 5i',
    explanation:
      'Each term is a multiple of 5: 5(1), 5(2), 5(3), 5(4). There are 4 terms, so i runs from ' +
      '1 to 4 and the general term is 5i.',
    order: 3,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from i = 1 to 6 of 4. (Enter the number only.)',
    choices: [],
    correctAnswer: '24',
    explanation:
      'The general term 4 does not contain i, so the constant is added once for each of the 6 ' +
      'values of i: 4 × 6 = 24.',
    order: 4,
  },
  {
    type: 'true_false',
    question: 'Σ from k = 1 to 3 of (k + 2) is equal to 12.',
    choices: [],
    correctAnswer: true,
    explanation: '(1 + 2) + (2 + 2) + (3 + 2) = 3 + 4 + 5 = 12, so the statement is true.',
    order: 5,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from i = 1 to 4 of i³. (Enter the number only.)',
    choices: [],
    correctAnswer: '100',
    explanation: '1³ + 2³ + 3³ + 4³ = 1 + 8 + 27 + 64 = 100.',
    order: 6,
  },
  {
    type: 'multiple_choice',
    question: 'Which sigma notation represents the series 2 + 4 + 6 + 8 + 10?',
    choices: [
      'Σ from i = 1 to 4 of 2i',
      'Σ from i = 1 to 5 of 2i',
      'Σ from i = 1 to 5 of (i + 2)',
      'Σ from i = 1 to 5 of i\u00B2',
    ],
    correctAnswer: 'Σ from i = 1 to 5 of 2i',
    explanation:
      'Each term is 2 times its position: 2(1), 2(2), 2(3), 2(4), 2(5). There are 5 terms, so ' +
      'the upper limit is 5. Using 4 as the upper limit would drop the last term.',
    order: 7,
  },
  {
    type: 'fill_blank',
    question:
      'Evaluate Σ from i = 2 to 5 of i. Note that the lower limit is 2, not 1. ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '14',
    explanation:
      'The index starts at 2: 2 + 3 + 4 + 5 = 14. Starting at 1 by mistake would wrongly give 15.',
    order: 8,
  },
  {
    type: 'multiple_choice',
    question: 'Evaluate Σ from i = 1 to 3 of (i² − 1)',
    choices: ['8', '11', '13', '14'],
    correctAnswer: '11',
    explanation:
      'Substitute each value: (1² − 1) = 0, (2² − 1) = 3, (3² − 1) = 8. Sum = 0 + 3 + 8 = 11.',
    order: 9,
  },
  {
    type: 'true_false',
    question: 'Σ from i = 1 to 4 of 3 is equal to 12.',
    choices: [],
    correctAnswer: true,
    explanation:
      'The general term is the constant 3, added once for each of the 4 values of i: ' +
      '3 × 4 = 12, so the statement is true.',
    order: 10,
  },
];

const seedTopic1Week1 = () =>
  seedModuleWithActivities({
    label: 'W1 T1',
    moduleData,
    practiceActivities,
    gradedActivities,
  });

export default seedTopic1Week1;
