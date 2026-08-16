import Module from '../models/Module.js';
import Activity from '../models/Activity.js';

/**
 * Week 1 content — Topics 1 and 2 only.
 *
 *   Topic 1: Represent series using sigma notation and vice versa.
 *   Topic 2: Apply a percentage increase or decrease in various contexts:
 *            determining the impact of inflation on costs and wages over time.
 *
 * Topics 3 and 4 (profit/loss, deductions) belong to the following week and
 * are deliberately not included here.
 *
 * Idempotent: skips entirely if the module already exists, so it is safe to
 * run on every server start.
 */

const MODULE_TITLE = 'Week 1 — Sigma Notation & Percentage Change';

const moduleData = {
  title:      MODULE_TITLE,
  subject:    'Mathematics',
  gradeLevel: 'Grade 11',
  quarter:    'Q1',

  objectives: [
    'Write a given series in sigma (Σ) notation.',
    'Expand a sigma expression back into a series and evaluate its sum.',
    'Compute a percentage increase or a percentage decrease.',
    'Apply percentage change to determine the impact of inflation on costs and wages over time.',
  ],

  competencies: [
    'Represent series using sigma notation and vice versa.',
    'Apply a percentage increase or decrease in various contexts: determining the impact of inflation on costs and wages over time.',
  ],

  discussion: `
<h3>Panel 1 — The Long Way</h3>
<p><strong>Miguel:</strong> Ma'am, our seatwork says to add 3 + 6 + 9 + 12 + 15. Do I really have to write every term?</p>
<p><strong>Teacher:</strong> You can — but mathematicians got tired of writing long sums too. So they invented a shortcut called <em>sigma notation</em>.</p>

<h3>Panel 2 — Meet Sigma</h3>
<p><strong>Teacher:</strong> The Greek capital letter <strong>Σ</strong> (sigma) means "add all of these up." We write:</p>
<p style="text-align:center"><strong>Σ</strong> from <strong>i = 1</strong> to <strong>5</strong> of <strong>3i</strong></p>
<p><strong>Teacher:</strong> Read it as: "the sum of 3i, as i goes from 1 to 5." Three parts matter — the <strong>index</strong> (i), the <strong>lower limit</strong> (where i starts), and the <strong>upper limit</strong> (where i stops). The expression after Σ is the <strong>general term</strong>.</p>

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
<p><strong>Careful:</strong> if the general term has no i in it at all — like Σ from i = 1 to 6 of 4 — you simply add that constant once for every value of i: 4 × 6 = 24.</p>

<h3>Panel 5 — Prices That Will Not Sit Still</h3>
<p><strong>Ana:</strong> Ma'am, different problem. Rice was ₱50 per kilo last year and it's ₱53 now. How much did it go up?</p>
<p><strong>Teacher:</strong> In pesos, ₱3. But to compare fairly across items, we use <strong>percentage change</strong>:</p>
<p style="text-align:center"><strong>percentage change = (new value − old value) ÷ old value × 100</strong></p>
<p>(53 − 50) ÷ 50 × 100 = 3 ÷ 50 × 100 = <strong>6%</strong></p>
<p>That 6% rise in the general price level is what we call <strong>inflation</strong>.</p>

<h3>Panel 6 — The Shortcut Multiplier</h3>
<p><strong>Teacher:</strong> To go straight to the new price, multiply by (1 + r), where r is the rate as a decimal. A 6% increase means × 1.06. A 6% <em>decrease</em> means × 0.94.</p>
<p>And for two years of 6% inflation, you apply it twice — to the already-raised price:</p>
<p>₱50 × 1.06 = ₱53.00 → ₱53.00 × 1.06 = <strong>₱56.18</strong></p>
<p><strong>Miguel:</strong> Not ₱56, because the second 6% is taken on ₱53, not on ₱50!</p>
<p><strong>Teacher:</strong> Exactly. That is the most common mistake in this lesson.</p>

<h3>Panel 7 — Does a Raise Actually Help?</h3>
<p><strong>Ana:</strong> My mother's wage went up 4% but prices went up 6%. Is she better off?</p>
<p><strong>Teacher:</strong> Let's check. Her ₱18,000 wage becomes ₱18,000 × 1.04 = ₱18,720. But everything she buys now costs 1.06 times as much. Compare the two multipliers:</p>
<p>1.04 ÷ 1.06 = 0.9811… → a change of about <strong>−1.89%</strong></p>
<p><strong>Teacher:</strong> So her <em>nominal</em> wage rose, but her <strong>purchasing power</strong> — what the money can actually buy — fell by roughly 1.89%. A raise only keeps you even when it matches inflation exactly.</p>
`.trim(),

  concepts: [
    'Σ (sigma) notation is shorthand for a sum: Σ from i = 1 to n of aᵢ means a₁ + a₂ + … + aₙ.',
    'A sigma expression has four parts: the index (i), the lower limit, the upper limit, and the general term.',
    'To expand sigma notation, substitute each value of the index in turn and add the results.',
    'To write a series in sigma notation, find the rule that produces each term, then set the limits to match the number of terms.',
    'If the general term contains no index, the constant is added once per value of the index: Σ from i = 1 to n of c = c × n.',
    'Percentage change = (new value − old value) ÷ old value × 100. A positive result is an increase, a negative result is a decrease.',
    'To apply an r% increase directly, multiply by (1 + r/100); for an r% decrease, multiply by (1 − r/100).',
    'Repeated inflation compounds: each year’s rate applies to the already-adjusted amount, so two years at 6% is × 1.06 × 1.06, not × 1.12.',
    'Purchasing power rises only when a wage increase exceeds inflation. If the wage rises more slowly than prices, real income falls even though the peso amount is larger.',
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
      title: 'Example 3 — Inflation over two years',
      content:
        'Rice costs ₱50 per kilo. Inflation is 6% per year. What will it cost after two years?\n\n' +
        'Year 1:  ₱50 × 1.06 = ₱53.00\n' +
        'Year 2:  ₱53.00 × 1.06 = ₱56.18\n\n' +
        'Note: the second year’s 6% is taken on ₱53.00, not on the original ₱50.\n' +
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
    'Oronce, O. A., & Mendoza, M. O. (2016). E-Math: Worktext in Mathematics. Rex Book Store.',
    'Philippine Statistics Authority. (2024). Consumer Price Index and Inflation Rate.',
  ],
  isPublished: true,
};

// ── Practice activities (unscored warm-up) ────────────────────
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
    type: 'multiple_choice',
    question: 'A notebook costs ₱80. Its price increases by 10%. What is the new price?',
    choices: ['₱72', '₱88', '₱90', '₱8'],
    correctAnswer: '₱88',
    explanation: 'Increase = 10% of ₱80 = 0.10 × 80 = ₱8. New price = ₱80 + ₱8 = ₱88.',
    order: 3,
  },
  {
    type: 'true_false',
    question: 'If the price of an item rises from ₱200 to ₱250, the percentage increase is 25%.',
    choices: [],
    correctAnswer: true,
    explanation: 'Increase = ₱250 − ₱200 = ₱50. Percentage increase = (50 ÷ 200) × 100 = 25%, so the statement is true.',
    order: 4,
  },
];

// ── Graded activities ─────────────────────────────────────────
const gradedActivities = [
  // Topic 1 — sigma notation
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
      'Each term is a multiple of 5: 5(1), 5(2), 5(3), 5(4). There are 4 terms, so i runs from 1 to 4 ' +
      'and the general term is 5i.',
    order: 3,
  },
  {
    type: 'fill_blank',
    question: 'Evaluate Σ from i = 1 to 6 of 4. (Enter the number only.)',
    choices: [],
    correctAnswer: '24',
    explanation:
      'The general term 4 does not contain i, so the constant is added once for each of the 6 values ' +
      'of i: 4 × 6 = 24.',
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

  // Topic 2 — percentage change, inflation on costs and wages
  {
    type: 'multiple_choice',
    question: 'A sack of rice costs ₱2,400. Because of inflation its price rises by 6%. What is the new price?',
    choices: ['₱2,406', '₱2,256', '₱2,544', '₱3,840'],
    correctAnswer: '₱2,544',
    explanation:
      'Increase = 6% of ₱2,400 = 0.06 × 2,400 = ₱144. New price = ₱2,400 + ₱144 = ₱2,544. ' +
      'Equivalently, ₱2,400 × 1.06 = ₱2,544.',
    order: 6,
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
      'which rounds to 15.38%.',
    order: 7,
  },
  {
    type: 'multiple_choice',
    question:
      'A worker earns ₱20,000 per month. She receives a 5% increase this year and another 5% increase ' +
      'next year. What is her monthly salary after both increases?',
    choices: ['₱21,000', '₱22,000', '₱22,050', '₱24,200'],
    correctAnswer: '₱22,050',
    explanation:
      'First increase: ₱20,000 × 1.05 = ₱21,000. Second increase: ₱21,000 × 1.05 = ₱22,050. ' +
      'This is more than a flat 10% (₱22,000) because the second 5% is applied to the already-raised salary.',
    order: 8,
  },
  {
    type: 'fill_blank',
    question:
      'The price of a gadget dropped from ₱1,200 to ₱1,020. What is the percentage decrease? ' +
      '(Enter the number only.)',
    choices: [],
    correctAnswer: '15',
    explanation:
      'Decrease = ₱1,200 − ₱1,020 = ₱180. Percentage decrease = (180 ÷ 1,200) × 100 = 15%.',
    order: 9,
  },
  {
    type: 'true_false',
    question:
      "If prices rise by 7% in a year and a worker's wage also rises by exactly 7% in that same year, " +
      "the worker's purchasing power stays the same.",
    choices: [],
    correctAnswer: true,
    explanation:
      'Both the wage and prices are multiplied by 1.07, so the amount of goods the wage can buy is unchanged. ' +
      'Purchasing power only falls when wages rise more slowly than prices.',
    order: 10,
  },
];

const buildActivities = (moduleId) => [
  ...practiceActivities.map((a) => ({ ...a, isPractice: true,  points: 1, moduleId })),
  ...gradedActivities.map((a)   => ({ ...a, isPractice: false, points: 1, moduleId })),
];

const seedWeek1 = async () => {
  try {
    const existing = await Module.findOne({ title: MODULE_TITLE });

    // The module existing is not proof the content is complete: if a previous
    // run created the module but failed on insertMany, the old check skipped
    // forever and students saw a topic with zero questions. Verify the
    // activities too, and repair rather than skip.
    if (existing) {
      const count = await Activity.countDocuments({ moduleId: existing._id });
      const expected = practiceActivities.length + gradedActivities.length;

      if (count === expected) {
        console.log('✅ Week 1 content already complete — skipping seed');
        return;
      }

      console.warn(`⚠️  Week 1 module exists but has ${count}/${expected} activities — repairing`);
      await Activity.deleteMany({ moduleId: existing._id });
      await Activity.insertMany(buildActivities(existing._id));
      console.log(`🌱 Week 1 activities repaired (${expected} items)`);
      return;
    }

    const module = await Module.create(moduleData);

    try {
      await Activity.insertMany(buildActivities(module._id));
    } catch (err) {
      // Don't leave a module with no questions behind — undo it so the next
      // boot retries cleanly instead of silently "skipping" a broken topic.
      await Module.findByIdAndDelete(module._id);
      throw err;
    }

    console.log('🌱 Week 1 content seeded successfully');
    console.log(`   Module     : ${module.title}`);
    console.log(`   Practice   : ${practiceActivities.length} items (unscored)`);
    console.log(`   Graded     : ${gradedActivities.length} items (${gradedActivities.length} points)`);
  } catch (err) {
    console.error('❌ Week 1 seeder error:', err.message);
  }
};

export default seedWeek1;
