import { seedModuleWithActivities } from './seedHelper.js';

/**
 * Week 1, Topic 2.
 *
 *   Topic 2: Apply a percentage increase or decrease in various contexts:
 *            determining the impact of inflation on costs and wages over time.
 *
 * Topic 1 (sigma notation) is the other Week 1 topic; it has its own module so
 * the two can be released on separate dates.
 */

const moduleData = {
  title:      'Week 1 · Topic 2 — Percentage Change and Inflation',
  subject:    'Mathematics',
  gradeLevel: 'Grade 11',
  quarter:    'Q1',

  objectives: [
    'Compute a percentage increase or a percentage decrease.',
    'Apply a rate directly using the multiplier (1 + r) or (1 − r).',
    'Determine the effect of inflation on costs over more than one year.',
    'Compare a wage increase against inflation to judge whether purchasing power rose or fell.',
  ],

  competencies: [
    'Apply a percentage increase or decrease in various contexts: determining the impact of inflation on costs and wages over time.',
  ],

  discussion: `
<h3>Panel 1 — Prices That Will Not Sit Still</h3>
<p><strong>Ana:</strong> Ma'am, rice was ₱50 per kilo last year and it's ₱53 now. How much did it go up?</p>
<p><strong>Teacher:</strong> In pesos, ₱3. But to compare fairly across items, we use <strong>percentage change</strong>:</p>
<p style="text-align:center"><strong>percentage change = (new value − old value) ÷ old value × 100</strong></p>
<p>(53 − 50) ÷ 50 × 100 = 3 ÷ 50 × 100 = <strong>6%</strong></p>
<p>That rise in the general price level is what we call <strong>inflation</strong>.</p>

<h3>Panel 2 — Always Divide by the OLD Value</h3>
<p><strong>Miguel:</strong> Why divide by 50 and not by 53?</p>
<p><strong>Teacher:</strong> Because we are measuring the change <em>relative to where it started</em>. The old value is the reference point. Dividing by the new value is the most common mistake in this topic and gives a different, wrong answer.</p>

<h3>Panel 3 — The Shortcut Multiplier</h3>
<p><strong>Teacher:</strong> To jump straight to the new price, multiply by (1 + r), where r is the rate as a decimal:</p>
<p style="text-align:center"><strong>increase of r% → × (1 + r)</strong> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>decrease of r% → × (1 − r)</strong></p>
<p>A 6% increase means × 1.06. A 6% decrease means × 0.94. A 15% decrease means × 0.85.</p>
<p><strong>Ana:</strong> So I don't have to compute the peso change first?</p>
<p><strong>Teacher:</strong> Not if you only need the final amount. One multiplication instead of two steps.</p>

<h3>Panel 4 — Two Years of Inflation</h3>
<p><strong>Teacher:</strong> Here is where people slip. Rice at ₱50, inflation 6% per year, for two years:</p>
<p>Year 1: ₱50 × 1.06 = ₱53.00<br/>
Year 2: ₱53.00 × 1.06 = <strong>₱56.18</strong></p>
<p><strong>Miguel:</strong> Not ₱56 — because the second 6% is taken on ₱53, not on the original ₱50!</p>
<p><strong>Teacher:</strong> Exactly. Inflation <strong>compounds</strong>. Two years at 6% is × 1.06 × 1.06, which is × 1.1236 — not × 1.12.</p>

<h3>Panel 5 — Does a Raise Actually Help?</h3>
<p><strong>Ana:</strong> My mother's wage went up 4% but prices went up 6%. Is she better off?</p>
<p><strong>Teacher:</strong> Let's check. Her ₱18,000 becomes ₱18,000 × 1.04 = ₱18,720. More pesos. But everything she buys now costs 1.06 times as much. Compare the multipliers:</p>
<p>1.04 ÷ 1.06 = 0.9811… → about <strong>−1.89%</strong></p>
<p><strong>Teacher:</strong> Her <em>nominal</em> wage rose, but her <strong>purchasing power</strong> — what the money can actually buy — fell by roughly 1.89%.</p>

<h3>Panel 6 — The Rule to Remember</h3>
<p><strong>Teacher:</strong> Compare the wage increase against inflation:</p>
<p>wage rise <strong>&gt;</strong> inflation → purchasing power rises<br/>
wage rise <strong>=</strong> inflation → purchasing power unchanged<br/>
wage rise <strong>&lt;</strong> inflation → purchasing power falls</p>
<p><strong>Miguel:</strong> So a raise that just matches inflation isn't really a raise.</p>
<p><strong>Teacher:</strong> It keeps you exactly where you were. That is why people talk about a "real" increase.</p>
`.trim(),

  concepts: [
    'Percentage change = (new value − old value) ÷ old value × 100. Always divide by the OLD value.',
    'A positive result is an increase; a negative result is a decrease.',
    'To apply an r% increase directly, multiply by (1 + r/100); for an r% decrease, multiply by (1 − r/100).',
    'Inflation is a percentage rise in the general price level.',
    'Inflation compounds: each year’s rate applies to the already-adjusted amount.',
    'Two years at 6% is × 1.06 × 1.06 = × 1.1236, not × 1.12.',
    'Nominal wage is the peso amount; purchasing power is what that amount can actually buy.',
    'Purchasing power rises only when the wage increase exceeds inflation.',
    'If the wage rises more slowly than prices, real income falls even though the peso amount is larger.',
  ],

  examples: [
    {
      title: 'Example 1 — Percentage increase',
      content:
        'Rice rose from ₱50 to ₱53 per kilo. What is the percentage increase?\n\n' +
        'Increase = 53 − 50 = ₱3\n' +
        '% increase = (3 ÷ 50) × 100 = 6%\n\n' +
        'Note: divide by the OLD value (50), not the new one.\n\n' +
        'Answer: 6%',
      image: '',
    },
    {
      title: 'Example 2 — Applying a rate with the multiplier',
      content:
        'A sack of rice costs ₱2,400. Inflation raises it by 6%. What is the new price?\n\n' +
        'Method 1: Increase = 0.06 × 2,400 = ₱144, so 2,400 + 144 = ₱2,544\n' +
        'Method 2: 2,400 × 1.06 = ₱2,544\n\n' +
        'Answer: ₱2,544',
      image: '',
    },
    {
      title: 'Example 3 — Inflation over two years',
      content:
        'Rice costs ₱50 per kilo. Inflation is 6% per year. What will it cost after two years?\n\n' +
        'Year 1:  ₱50 × 1.06 = ₱53.00\n' +
        'Year 2:  ₱53.00 × 1.06 = ₱56.18\n\n' +
        'The second year’s 6% is taken on ₱53.00, not on the original ₱50.\n' +
        'This is why the answer is ₱56.18 and not ₱56.00.\n\n' +
        'Answer: ₱56.18',
      image: '',
    },
    {
      title: 'Example 4 — Does the raise keep up with inflation?',
      content:
        'A worker earns ₱18,000 per month. Her wage rises by 4%, but prices rise by 6%.\n\n' +
        'New wage:  ₱18,000 × 1.04 = ₱18,720\n' +
        'Compare the multipliers: 1.04 ÷ 1.06 = 0.9811…\n' +
        'Change in purchasing power: (0.9811 − 1) × 100 ≈ −1.89%\n\n' +
        'Her salary in pesos went up, but what it can buy went down by about 1.89%.\n\n' +
        'Answer: the wage rises to ₱18,720, but purchasing power falls by about 1.89%',
      image: '',
    },
  ],

  developer:  'Jovanny De Leon',
  references: [
    'Department of Education. (2016). K to 12 Most Essential Learning Competencies in Mathematics.',
    'Philippine Statistics Authority. (2024). Consumer Price Index and Inflation Rate.',
    'Oronce, O. A., & Mendoza, M. O. (2016). E-Math: Worktext in Mathematics. Rex Book Store.',
  ],
  isPublished: true,
};

const practiceActivities = [
  {
    type: 'fill_blank',
    question:
      'A price rose from ₱100 to ₱120. What is the percentage increase? (Enter the number only.)',
    choices: [],
    correctAnswer: '20',
    explanation: 'Increase = 120 − 100 = ₱20. % increase = (20 ÷ 100) × 100 = 20%.',
    order: 1,
  },
  {
    type: 'multiple_choice',
    question: 'A notebook costs ₱80. Its price increases by 10%. What is the new price?',
    choices: ['₱72', '₱88', '₱90', '₱8'],
    correctAnswer: '₱88',
    explanation: 'Increase = 10% of ₱80 = 0.10 × 80 = ₱8. New price = ₱80 + ₱8 = ₱88.',
    order: 2,
  },
  {
    type: 'multiple_choice',
    question: 'An item costing ₱500 is reduced by 20%. What is the new price?',
    choices: ['₱380', '₱400', '₱420', '₱480'],
    correctAnswer: '₱400',
    explanation: 'A 20% decrease means × (1 − 0.20) = × 0.80. So 500 × 0.80 = ₱400.',
    order: 3,
  },
  {
    type: 'true_false',
    question: 'If the price of an item rises from ₱200 to ₱250, the percentage increase is 25%.',
    choices: [],
    correctAnswer: true,
    explanation:
      'Increase = ₱250 − ₱200 = ₱50. % increase = (50 ÷ 200) × 100 = 25%, so the statement is true.',
    order: 4,
  },
];

const gradedActivities = [
  {
    type: 'multiple_choice',
    question: 'A sack of rice costs ₱2,400. Because of inflation its price rises by 6%. What is the new price?',
    choices: ['₱2,406', '₱2,256', '₱2,544', '₱3,840'],
    correctAnswer: '₱2,544',
    explanation:
      'Increase = 6% of ₱2,400 = 0.06 × 2,400 = ₱144. New price = ₱2,400 + ₱144 = ₱2,544. ' +
      'Equivalently, ₱2,400 × 1.06 = ₱2,544.',
    order: 1,
  },
  {
    type: 'fill_blank',
    question:
      'A jeepney fare rose from ₱13.00 to ₱15.00. What is the percentage increase? ' +
      'Round to two decimal places and enter the number only (for example: 12.34).',
    choices: [],
    correctAnswer: '15.38',
    explanation:
      'Increase = ₱15 − ₱13 = ₱2. Percentage increase = (2 ÷ 13) × 100 = 15.3846…, ' +
      'which rounds to 15.38%. Dividing by 15 instead of 13 is the common error.',
    order: 2,
  },
  {
    type: 'multiple_choice',
    question:
      'A worker earns ₱20,000 per month. She receives a 5% increase this year and another 5% ' +
      'increase next year. What is her monthly salary after both increases?',
    choices: ['₱21,000', '₱22,000', '₱22,050', '₱24,200'],
    correctAnswer: '₱22,050',
    explanation:
      'First increase: ₱20,000 × 1.05 = ₱21,000. Second increase: ₱21,000 × 1.05 = ₱22,050. ' +
      'This is more than a flat 10% (₱22,000) because the second 5% is applied to the ' +
      'already-raised salary.',
    order: 3,
  },
  {
    type: 'fill_blank',
    question:
      'The price of a gadget dropped from ₱1,200 to ₱1,020. What is the percentage decrease? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '15',
    explanation: 'Decrease = ₱1,200 − ₱1,020 = ₱180. Percentage decrease = (180 ÷ 1,200) × 100 = 15%.',
    order: 4,
  },
  {
    type: 'true_false',
    question:
      "If prices rise by 7% in a year and a worker's wage also rises by exactly 7% in that same " +
      "year, the worker's purchasing power stays the same.",
    choices: [],
    correctAnswer: true,
    explanation:
      'Both the wage and prices are multiplied by 1.07, so the amount of goods the wage can buy ' +
      'is unchanged. Purchasing power only falls when wages rise more slowly than prices.',
    order: 5,
  },
  {
    type: 'fill_blank',
    question:
      'Rice costs ₱50 per kilo and inflation is 6% per year. What will it cost after TWO years? ' +
      'Round to two decimal places and enter the number only.',
    choices: [],
    correctAnswer: '56.18',
    explanation:
      'Year 1: 50 × 1.06 = ₱53.00. Year 2: 53.00 × 1.06 = ₱56.18. The second year’s rate applies ' +
      'to ₱53.00, not to the original ₱50, so the answer is not ₱56.00.',
    order: 6,
  },
  {
    type: 'multiple_choice',
    question: 'A worker earning ₱18,000 per month receives a 4% wage increase. What is the new wage?',
    choices: ['₱18,072', '₱18,400', '₱18,720', '₱25,200'],
    correctAnswer: '₱18,720',
    explanation: 'New wage = ₱18,000 × 1.04 = ₱18,720.',
    order: 7,
  },
  {
    type: 'multiple_choice',
    question: 'By what number do you multiply to apply a 15% DECREASE?',
    choices: ['0.15', '0.85', '1.15', '1.85'],
    correctAnswer: '0.85',
    explanation:
      'A decrease of r% means multiplying by (1 − r). Here 1 − 0.15 = 0.85. ' +
      'Multiplying by 1.15 would apply an increase instead.',
    order: 8,
  },
  {
    type: 'fill_blank',
    question:
      'A product rose in price from ₱1,500 to ₱1,725. What is the percentage increase? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '15',
    explanation: 'Increase = 1,725 − 1,500 = ₱225. % increase = (225 ÷ 1,500) × 100 = 15%.',
    order: 9,
  },
  {
    type: 'true_false',
    question:
      "If a worker's wage rises by 3% in a year when inflation is 5%, the worker's purchasing " +
      'power has fallen.',
    choices: [],
    correctAnswer: true,
    explanation:
      'The wage rose more slowly than prices (3% < 5%), so the same salary buys less than before. ' +
      'Purchasing power falls whenever the wage increase is smaller than inflation, so the ' +
      'statement is true.',
    order: 10,
  },
];

const seedTopic2Week1 = () =>
  seedModuleWithActivities({
    label: 'W1 T2',
    moduleData,
    practiceActivities,
    gradedActivities,
  });

export default seedTopic2Week1;
