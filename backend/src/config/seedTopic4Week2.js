import { seedModuleWithActivities } from './seedHelper.js';

/**
 * Week 2, Topic 4.
 *
 *   Topic 4: Solve problems involving deductions (tax computations & overtime pay).
 *
 * Overtime convention: ordinary working day at 125% of the hourly rate, per the
 * Philippine Labor Code. Rest-day and holiday premiums are NOT introduced —
 * they are outside the stated learning target.
 *
 * All contribution amounts are GIVEN in each problem rather than derived from
 * live SSS/PhilHealth tables, so no item can go stale or be graded against an
 * outdated schedule.
 */

const moduleData = {
  title:      'Week 2 · Topic 4 — Deductions, Tax and Overtime Pay',
  subject:    'Mathematics',
  gradeLevel: 'Grade 11',
  quarter:    'Q1',

  objectives: [
    'Compute the hourly rate from a daily or monthly salary.',
    'Compute overtime pay on an ordinary working day using the 125% premium.',
    'Compute gross pay from basic pay and overtime pay.',
    'Compute total deductions and net pay ("take-home" pay).',
  ],

  competencies: [
    'Solve problems involving deductions (tax computations & overtime pay).',
  ],

  discussion: `
<h3>Panel 1 — Why Is My Pay Smaller?</h3>
<p><strong>Miguel:</strong> Ma'am, my ate's contract says ₱18,000 a month, but her payslip says ₱15,890. Was she shortchanged?</p>
<p><strong>Teacher:</strong> No — that is the difference between <strong>gross pay</strong> and <strong>net pay</strong>. Money is deducted before it reaches her.</p>

<h3>Panel 2 — The Two Halves of a Payslip</h3>
<p><strong>Teacher:</strong> Every payslip has an earnings side and a deductions side:</p>
<p style="text-align:center"><strong>Gross pay = basic pay + overtime pay</strong></p>
<p style="text-align:center"><strong>Net pay = gross pay − total deductions</strong></p>
<p>The usual deductions in the Philippines are <strong>SSS</strong>, <strong>PhilHealth</strong>, <strong>Pag-IBIG</strong>, and <strong>withholding tax</strong>.</p>

<h3>Panel 3 — Ate's Payslip</h3>
<p>Gross pay: ₱18,000</p>
<p>SSS ₱810 + PhilHealth ₱450 + Pag-IBIG ₱100 + withholding tax ₱750</p>
<p>Total deductions = 810 + 450 + 100 + 750 = <strong>₱2,110</strong><br/>
Net pay = 18,000 − 2,110 = <strong>₱15,890</strong></p>
<p><strong>Miguel:</strong> So nothing was stolen — it just went to SSS, PhilHealth, Pag-IBIG and the BIR.</p>
<p><strong>Teacher:</strong> Exactly. Add the deductions first, then subtract once. Subtracting one at a time works too, but is easier to slip on.</p>

<h3>Panel 4 — Finding the Hourly Rate</h3>
<p><strong>Ana:</strong> What if someone is paid daily and works extra hours?</p>
<p><strong>Teacher:</strong> First convert to an hourly rate. A standard working day is 8 hours:</p>
<p style="text-align:center"><strong>hourly rate = daily rate ÷ 8</strong></p>
<p>A daily rate of ₱640 gives 640 ÷ 8 = <strong>₱80 per hour</strong>.</p>

<h3>Panel 5 — Overtime Is Paid at a Premium</h3>
<p><strong>Teacher:</strong> Under the Labor Code, overtime on an <em>ordinary working day</em> is paid at <strong>125%</strong> of the hourly rate — the normal hour plus a 25% premium.</p>
<p style="text-align:center"><strong>OT pay = hourly rate × 1.25 × OT hours</strong></p>
<p>Three hours of overtime at ₱80 per hour:</p>
<p>80 × 1.25 = ₱100 per overtime hour<br/>
100 × 3 = <strong>₱300</strong></p>
<p><strong>Ana:</strong> Not ₱240 — because each overtime hour is worth ₱100, not ₱80.</p>
<p><strong>Teacher:</strong> That is the single most common mistake in this lesson. Forgetting the 1.25 costs you the whole item.</p>

<h3>Panel 6 — Putting It All Together</h3>
<p><strong>Teacher:</strong> A worker earns ₱800 per day and worked 22 days, plus 5 hours of overtime.</p>
<p>Basic pay   = 800 × 22 = ₱17,600<br/>
Hourly rate = 800 ÷ 8 = ₱100<br/>
OT pay      = 100 × 1.25 × 5 = ₱625<br/>
<strong>Gross pay = 17,600 + 625 = ₱18,225</strong></p>
<p><strong>Teacher:</strong> Then subtract the deductions to get the take-home pay. Work in that order every time: hourly rate → overtime → gross → deductions → net.</p>
`.trim(),

  concepts: [
    'Gross pay = basic pay + overtime pay. It is the amount before anything is taken out.',
    'Net pay (take-home pay) = gross pay − total deductions.',
    'The usual Philippine deductions are SSS, PhilHealth, Pag-IBIG and withholding tax.',
    'Add all deductions first, then subtract once from gross pay.',
    'Hourly rate = daily rate ÷ 8, since a standard working day is 8 hours.',
    'Overtime on an ordinary working day is paid at 125% of the hourly rate.',
    'OT pay = hourly rate × 1.25 × number of overtime hours.',
    'Forgetting the 1.25 premium is the most common error — an overtime hour is worth more than a regular hour.',
    'Work in a fixed order: hourly rate → overtime pay → gross pay → total deductions → net pay.',
  ],

  examples: [
    {
      title: 'Example 1 — Hourly rate and overtime pay',
      content:
        'A worker earns ₱640 per day and rendered 3 hours of overtime on an ordinary day.\n\n' +
        'Hourly rate = 640 ÷ 8 = ₱80\n' +
        'OT rate     = 80 × 1.25 = ₱100 per hour\n' +
        'OT pay      = 100 × 3 = ₱300\n\n' +
        'Answer: ₱300\n\n' +
        'Note: 80 × 3 = ₱240 is the common wrong answer — it ignores the 25% premium.',
      image: '',
    },
    {
      title: 'Example 2 — Total deductions and net pay',
      content:
        'Gross pay is ₱18,000. Deductions: SSS ₱810, PhilHealth ₱450, Pag-IBIG ₱100, tax ₱750.\n\n' +
        'Total deductions = 810 + 450 + 100 + 750 = ₱2,110\n' +
        'Net pay          = 18,000 − 2,110 = ₱15,890\n\n' +
        'Answer: ₱15,890 take-home pay',
      image: '',
    },
    {
      title: 'Example 3 — Gross pay with overtime',
      content:
        'A worker earns ₱800 per day, worked 22 days, and rendered 5 hours of overtime.\n\n' +
        'Basic pay   = 800 × 22 = ₱17,600\n' +
        'Hourly rate = 800 ÷ 8 = ₱100\n' +
        'OT pay      = 100 × 1.25 × 5 = ₱625\n' +
        'Gross pay   = 17,600 + 625 = ₱18,225\n\n' +
        'Answer: ₱18,225',
      image: '',
    },
    {
      title: 'Example 4 — A deduction given as a percentage',
      content:
        'A worker has a monthly basic pay of ₱20,000. The Pag-IBIG contribution is 2% of basic pay.\n\n' +
        'Contribution = 20,000 × 0.02 = ₱400\n\n' +
        'Answer: ₱400\n\n' +
        'Percentage deductions use the same method as any percentage: multiply by the rate as a decimal.',
      image: '',
    },
  ],

  developer:  'Jovanny De Leon',
  references: [
    'Department of Education. (2016). K to 12 Most Essential Learning Competencies in Mathematics.',
    'Presidential Decree No. 442, Labor Code of the Philippines, Article 87 (Overtime Work).',
    'Department of Labor and Employment. Handbook on Workers’ Statutory Monetary Benefits.',
  ],
  isPublished: true,
};

const practiceActivities = [
  {
    type: 'fill_blank',
    question:
      'A worker earns ₱640 per day. What is the hourly rate in pesos, based on an 8-hour day? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '80',
    explanation: 'Hourly rate = daily rate ÷ 8 = 640 ÷ 8 = ₱80.',
    order: 1,
  },
  {
    type: 'multiple_choice',
    question:
      'An employee has a gross pay of ₱12,000 and total deductions of ₱1,500. What is the net pay?',
    choices: ['₱10,000', '₱10,500', '₱11,500', '₱13,500'],
    correctAnswer: '₱10,500',
    explanation: 'Net pay = gross pay − total deductions = 12,000 − 1,500 = ₱10,500.',
    order: 2,
  },
  {
    type: 'true_false',
    question: 'Overtime work on an ordinary day is paid at the same rate as a regular hour.',
    choices: [],
    correctAnswer: false,
    explanation:
      'It is paid at 125% of the hourly rate — the regular hour plus a 25% premium — so the ' +
      'statement is false.',
    order: 3,
  },
  {
    type: 'multiple_choice',
    question:
      'A worker with an hourly rate of ₱60 renders 2 hours of overtime on an ordinary day. ' +
      'How much is the overtime pay?',
    choices: ['₱120', '₱135', '₱150', '₱180'],
    correctAnswer: '₱150',
    explanation: 'OT pay = 60 × 1.25 × 2 = 75 × 2 = ₱150. (₱120 ignores the 25% premium.)',
    order: 4,
  },
];

const gradedActivities = [
  {
    type: 'fill_blank',
    question:
      'A worker earns ₱720 per day. What is the hourly rate in pesos, based on an 8-hour day? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '90',
    explanation: 'Hourly rate = 720 ÷ 8 = ₱90.',
    order: 1,
  },
  {
    type: 'multiple_choice',
    question:
      'A worker has an hourly rate of ₱80 and renders 3 hours of overtime on an ordinary ' +
      'working day. How much is the overtime pay?',
    choices: ['₱240', '₱300', '₱360', '₱400'],
    correctAnswer: '₱300',
    explanation:
      'OT rate = 80 × 1.25 = ₱100 per hour. OT pay = 100 × 3 = ₱300. ' +
      '₱240 is the result of forgetting the 25% premium.',
    order: 2,
  },
  {
    type: 'fill_blank',
    question:
      'An employee has these deductions: SSS ₱810, PhilHealth ₱450, Pag-IBIG ₱100, and ' +
      'withholding tax ₱750. What is the total deduction in pesos? (Enter the number only.)',
    choices: [],
    correctAnswer: '2110',
    explanation: 'Total deductions = 810 + 450 + 100 + 750 = ₱2,110.',
    order: 3,
  },
  {
    type: 'fill_blank',
    question:
      'Using the same deductions (SSS ₱810, PhilHealth ₱450, Pag-IBIG ₱100, tax ₱750), what ' +
      'is the net pay if the gross pay is ₱18,000? (Enter the number only.)',
    choices: [],
    correctAnswer: '15890',
    explanation:
      'Total deductions = ₱2,110. Net pay = 18,000 − 2,110 = ₱15,890.',
    order: 4,
  },
  {
    type: 'true_false',
    question: 'Net pay is the amount an employee receives after all deductions are subtracted.',
    choices: [],
    correctAnswer: true,
    explanation:
      'Net pay = gross pay − total deductions. It is the take-home amount, so the statement is true.',
    order: 5,
  },
  {
    type: 'fill_blank',
    question:
      'A worker has a monthly basic pay of ₱20,000. The Pag-IBIG contribution is 2% of the ' +
      'basic pay. How much is the contribution in pesos? (Enter the number only.)',
    choices: [],
    correctAnswer: '400',
    explanation: 'Contribution = 20,000 × 0.02 = ₱400.',
    order: 6,
  },
  {
    type: 'multiple_choice',
    question:
      'A worker earns ₱800 per day and worked 22 days, plus 5 hours of overtime on ordinary ' +
      'days. What is the gross pay?',
    choices: ['₱17,600', '₱18,100', '₱18,225', '₱18,400'],
    correctAnswer: '₱18,225',
    explanation:
      'Basic pay = 800 × 22 = ₱17,600. Hourly rate = 800 ÷ 8 = ₱100. ' +
      'OT pay = 100 × 1.25 × 5 = ₱625. Gross pay = 17,600 + 625 = ₱18,225. ' +
      '₱18,100 comes from forgetting the premium (100 × 5 = 500).',
    order: 7,
  },
  {
    type: 'multiple_choice',
    question:
      'An employee has a gross pay of ₱25,000 and total deductions of ₱3,200. What is the ' +
      'take-home pay?',
    choices: ['₱21,000', '₱21,800', '₱22,200', '₱28,200'],
    correctAnswer: '₱21,800',
    explanation: 'Net pay = 25,000 − 3,200 = ₱21,800.',
    order: 8,
  },
  {
    type: 'fill_blank',
    question:
      'A worker earns ₱560 per day and rendered 4 hours of overtime on an ordinary day. ' +
      'How much is the overtime pay in pesos? (Enter the number only.)',
    choices: [],
    correctAnswer: '350',
    explanation:
      'Hourly rate = 560 ÷ 8 = ₱70. OT rate = 70 × 1.25 = ₱87.50. ' +
      'OT pay = 87.50 × 4 = ₱350.',
    order: 9,
  },
  {
    type: 'true_false',
    question:
      'A worker whose hourly rate is ₱100 will earn ₱500 for 5 hours of overtime on an ' +
      'ordinary working day.',
    choices: [],
    correctAnswer: false,
    explanation:
      'Overtime is paid at 125%: 100 × 1.25 × 5 = ₱625, not ₱500. The statement ignores the ' +
      '25% premium, so it is false.',
    order: 10,
  },
];

const seedTopic4Week2 = () =>
  seedModuleWithActivities({
    label: 'W2 T4',
    moduleData,
    practiceActivities,
    gradedActivities,
  });

export default seedTopic4Week2;
