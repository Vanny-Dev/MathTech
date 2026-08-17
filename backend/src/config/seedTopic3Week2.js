import { seedModuleWithActivities } from './seedHelper.js';

/**
 * Week 2, Topic 3.
 *
 *   Topic 3: Apply a percentage increase or decrease in various contexts:
 *            calculating profit or loss in both absolute and percentage terms.
 *
 * Convention used throughout: percentage profit and percentage loss are taken
 * on the COST PRICE. This is stated explicitly in the lesson and repeated in
 * every question that asks for a percentage, so no item is ambiguous.
 */

const moduleData = {
  title:      'Week 2 · Topic 3 — Profit and Loss',
  subject:    'Mathematics',
  gradeLevel: 'Grade 11',
  quarter:    'Q1',
  week:        2,
  topicNumber: 3,

  objectives: [
    'Identify cost price and selling price in a business situation.',
    'Compute profit or loss in absolute terms (pesos).',
    'Compute percentage profit or percentage loss based on the cost price.',
    'Work backwards from a percentage profit or loss to find a missing cost or selling price.',
  ],

  competencies: [
    'Apply a percentage increase or decrease in various contexts: calculating profit or loss in both absolute and percentage terms.',
  ],

  discussion: `
<h3>Panel 1 — The Sari-sari Store</h3>
<p><strong>Ana:</strong> Ma'am, my mother buys shampoo sachets for ₱8 each and sells them for ₱10. She says she earns ₱2. Is that all there is to it?</p>
<p><strong>Teacher:</strong> That ₱2 is the <strong>profit</strong> — the absolute amount, in pesos. But ₱2 on an ₱8 item is a very different business from ₱2 on an ₱800 item. That is why we also measure profit as a <em>percentage</em>.</p>

<h3>Panel 2 — Two Prices, One Difference</h3>
<p><strong>Teacher:</strong> Every problem starts with two prices:</p>
<p><strong>Cost price (CP)</strong> — what the seller paid.<br/>
<strong>Selling price (SP)</strong> — what the buyer paid.</p>
<p>If SP is higher, there is a profit. If CP is higher, there is a loss.</p>
<p style="text-align:center"><strong>Profit = SP − CP</strong>  &nbsp;&nbsp;|&nbsp;&nbsp;  <strong>Loss = CP − SP</strong></p>
<p><strong>Miguel:</strong> So you always subtract the smaller from the bigger?</p>
<p><strong>Teacher:</strong> Yes — profit and loss are both reported as positive amounts. The word tells you which one it is.</p>

<h3>Panel 3 — Turning Pesos into Percent</h3>
<p><strong>Teacher:</strong> Now the important part. We compare the gain against <strong>what was invested</strong> — the cost price:</p>
<p style="text-align:center"><strong>% profit = (Profit ÷ CP) × 100</strong><br/>
<strong>% loss = (Loss ÷ CP) × 100</strong></p>
<p><strong>Teacher:</strong> Back to the shampoo. CP = ₱8, SP = ₱10.</p>
<p>Profit = 10 − 8 = ₱2<br/>
% profit = (2 ÷ 8) × 100 = <strong>25%</strong></p>
<p><strong>Ana:</strong> So every ₱8 she puts in comes back as ₱10 — a quarter more.</p>

<h3>Panel 4 — Careful: Divide by the Cost</h3>
<p><strong>Miguel:</strong> Why cost and not selling price? 2 ÷ 10 is 20%, which also looks reasonable.</p>
<p><strong>Teacher:</strong> Good eye — that other number is called the <em>margin</em>, and businesses do use it. But in this lesson, whenever we say "percentage profit" or "percentage loss", we always divide by the <strong>cost price</strong>. Every question will follow that rule.</p>

<h3>Panel 5 — When It Goes the Other Way</h3>
<p><strong>Teacher:</strong> A gadget was bought for ₱1,200 and had to be sold for ₱1,020.</p>
<p>Loss = 1,200 − 1,020 = ₱180<br/>
% loss = (180 ÷ 1,200) × 100 = <strong>15%</strong></p>
<p><strong>Teacher:</strong> Notice this is the same arithmetic as a percentage decrease. Profit and loss are just percentage change wearing a business uniform.</p>

<h3>Panel 6 — Working Backwards</h3>
<p><strong>Ana:</strong> What if I know the selling price and the percentage, but not the cost?</p>
<p><strong>Teacher:</strong> Use the multiplier. A 25% profit means SP is 1.25 times CP:</p>
<p style="text-align:center"><strong>SP = CP × (1 + r)</strong> for profit &nbsp;&nbsp;|&nbsp;&nbsp; <strong>SP = CP × (1 − r)</strong> for loss</p>
<p>If an item sells for ₱90 at a 25% profit:<br/>
CP × 1.25 = 90 → CP = 90 ÷ 1.25 = <strong>₱72</strong></p>
<p><strong>Miguel:</strong> Check: 72 × 1.25 = 90. It works.</p>
<p><strong>Teacher:</strong> Always check by substituting back. That habit will save you in the quiz.</p>
`.trim(),

  concepts: [
    'Cost price (CP) is what the seller paid; selling price (SP) is what the buyer paid.',
    'Profit = SP − CP when the selling price is higher.',
    'Loss = CP − SP when the cost price is higher. Both are reported as positive amounts.',
    'Percentage profit = (Profit ÷ CP) × 100 — always divided by the cost price.',
    'Percentage loss = (Loss ÷ CP) × 100 — also divided by the cost price.',
    'Profit in pesos alone can mislead: ₱2 on an ₱8 item is 25%, but ₱2 on an ₱800 item is only 0.25%.',
    'To apply a profit rate directly: SP = CP × (1 + r). For a loss: SP = CP × (1 − r).',
    'To find a missing cost price, divide instead of multiply: CP = SP ÷ (1 + r).',
    'Always substitute your answer back into the original problem to check it.',
  ],

  examples: [
    {
      title: 'Example 1 — Profit in pesos and in percent',
      content:
        'A vendor buys a notebook for ₱40 and sells it for ₱50.\n\n' +
        'Profit    = SP − CP = 50 − 40 = ₱10\n' +
        '% profit  = (10 ÷ 40) × 100 = 25%\n\n' +
        'Answer: ₱10 profit, which is 25% of the cost.',
      image: '',
    },
    {
      title: 'Example 2 — A loss',
      content:
        'A phone case was bought for ₱2,000 but had to be sold for ₱1,700.\n\n' +
        'Loss    = CP − SP = 2,000 − 1,700 = ₱300\n' +
        '% loss  = (300 ÷ 2,000) × 100 = 15%\n\n' +
        'Answer: ₱300 loss, which is 15% of the cost.',
      image: '',
    },
    {
      title: 'Example 3 — Buying and selling in bulk',
      content:
        'A store buys 20 pieces at ₱35 each and sells all of them at ₱50 each.\n\n' +
        'Total cost    = 20 × 35 = ₱700\n' +
        'Total sales   = 20 × 50 = ₱1,000\n' +
        'Profit        = 1,000 − 700 = ₱300\n' +
        '% profit      = (300 ÷ 700) × 100 = 42.857… ≈ 42.86%\n\n' +
        'Answer: ₱300 profit, about 42.86% of the cost.',
      image: '',
    },
    {
      title: 'Example 4 — Working backwards to the cost',
      content:
        'An item is sold for ₱90 at a profit of 25%. What did it cost?\n\n' +
        'SP = CP × (1 + 0.25) = CP × 1.25\n' +
        '90 = CP × 1.25\n' +
        'CP = 90 ÷ 1.25 = ₱72\n\n' +
        'Check: 72 × 1.25 = 90. Correct.\n\n' +
        'Answer: ₱72',
      image: '',
    },
  ],

  developer:  'Jovanny De Leon',
  references: [
    'Department of Education. (2016). K to 12 Most Essential Learning Competencies in Mathematics.',
    'Lopez, B. R., et al. (2016). Business Math for Senior High School. Vibal Group.',
    'Oronce, O. A., & Mendoza, M. O. (2016). E-Math: Worktext in Mathematics. Rex Book Store.',
  ],
  isPublished: true,
};

const practiceActivities = [
  {
    type: 'multiple_choice',
    question: 'An item costs ₱40 and is sold for ₱50. How much is the profit in pesos?',
    choices: ['₱5', '₱10', '₱15', '₱90'],
    correctAnswer: '₱10',
    explanation: 'Profit = SP − CP = ₱50 − ₱40 = ₱10.',
    order: 1,
  },
  {
    type: 'fill_blank',
    question:
      'An item costs ₱40 and is sold for ₱50. What is the percentage profit based on cost? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '25',
    explanation: 'Profit = ₱10. % profit = (10 ÷ 40) × 100 = 25%.',
    order: 2,
  },
  {
    type: 'true_false',
    question: 'If the selling price is lower than the cost price, the seller has a loss.',
    choices: [],
    correctAnswer: true,
    explanation:
      'A loss happens exactly when CP is greater than SP. Loss = CP − SP, so the statement is true.',
    order: 3,
  },
  {
    type: 'multiple_choice',
    question: 'A shirt costing ₱300 is sold at a 10% profit. What is the selling price?',
    choices: ['₱270', '₱310', '₱330', '₱360'],
    correctAnswer: '₱330',
    explanation: 'SP = CP × (1 + 0.10) = 300 × 1.10 = ₱330.',
    order: 4,
  },
];

const gradedActivities = [
  {
    type: 'multiple_choice',
    question: 'A bag costs ₱450 and is sold for ₱540. How much is the profit in pesos?',
    choices: ['₱80', '₱90', '₱100', '₱120'],
    correctAnswer: '₱90',
    explanation: 'Profit = SP − CP = ₱540 − ₱450 = ₱90.',
    order: 1,
  },
  {
    type: 'fill_blank',
    question:
      'A bag costs ₱450 and is sold for ₱540. What is the percentage profit based on cost? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '20',
    explanation: 'Profit = ₱90. % profit = (90 ÷ 450) × 100 = 20%.',
    order: 2,
  },
  {
    type: 'multiple_choice',
    question: 'A phone case was bought for ₱2,000 and sold for ₱1,700. How much is the loss?',
    choices: ['₱200', '₱300', '₱400', '₱1,700'],
    correctAnswer: '₱300',
    explanation: 'Loss = CP − SP = ₱2,000 − ₱1,700 = ₱300.',
    order: 3,
  },
  {
    type: 'fill_blank',
    question:
      'A phone case was bought for ₱2,000 and sold for ₱1,700. What is the percentage loss ' +
      'based on cost? (Enter the number only.)',
    choices: [],
    correctAnswer: '15',
    explanation: 'Loss = ₱300. % loss = (300 ÷ 2,000) × 100 = 15%.',
    order: 4,
  },
  {
    type: 'true_false',
    question: 'An item bought for ₱500 and sold for ₱600 gives a percentage profit of 20%.',
    choices: [],
    correctAnswer: true,
    explanation:
      'Profit = 600 − 500 = ₱100. % profit = (100 ÷ 500) × 100 = 20%, so the statement is true.',
    order: 5,
  },
  {
    type: 'fill_blank',
    question:
      'A store buys 20 pieces at ₱35 each and sells all of them at ₱50 each. What is the ' +
      'percentage profit based on cost? Round to two decimal places and enter the number only.',
    choices: [],
    correctAnswer: '42.86',
    explanation:
      'Total cost = 20 × 35 = ₱700. Total sales = 20 × 50 = ₱1,000. Profit = ₱300. ' +
      '% profit = (300 ÷ 700) × 100 = 42.857…, which rounds to 42.86%.',
    order: 6,
  },
  {
    type: 'multiple_choice',
    question: 'An item is sold for ₱90 at a profit of 25%. What was its cost price?',
    choices: ['₱65', '₱67.50', '₱72', '₱112.50'],
    correctAnswer: '₱72',
    explanation:
      'SP = CP × 1.25, so CP = 90 ÷ 1.25 = ₱72. Check: 72 × 1.25 = 90. ' +
      'A common error is taking 25% of ₱90 and subtracting, which wrongly gives ₱67.50.',
    order: 7,
  },
  {
    type: 'fill_blank',
    question:
      'An item costing ₱1,500 is sold at a loss of 12%. What is the selling price in pesos? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '1320',
    explanation: 'SP = CP × (1 − 0.12) = 1,500 × 0.88 = ₱1,320.',
    order: 8,
  },
  {
    type: 'multiple_choice',
    question:
      'A vendor buys mangoes for ₱1,800 and sells them for ₱2,250. What is the percentage ' +
      'profit based on cost?',
    choices: ['20%', '25%', '30%', '45%'],
    correctAnswer: '25%',
    explanation:
      'Profit = 2,250 − 1,800 = ₱450. % profit = (450 ÷ 1,800) × 100 = 25%. ' +
      'Dividing by the selling price instead would wrongly give 20%.',
    order: 9,
  },
  {
    type: 'true_false',
    question:
      'Earning ₱2 profit on an item that cost ₱8 is a better percentage return than earning ' +
      '₱2 profit on an item that cost ₱800.',
    choices: [],
    correctAnswer: true,
    explanation:
      'On the ₱8 item: (2 ÷ 8) × 100 = 25%. On the ₱800 item: (2 ÷ 800) × 100 = 0.25%. ' +
      'The same peso profit is a far better return on the cheaper item, so the statement is true.',
    order: 10,
  },
];

const seedTopic3Week2 = () =>
  seedModuleWithActivities({
    label: 'W2 T3',
    moduleData,
    practiceActivities,
    gradedActivities,
  });

export default seedTopic3Week2;
