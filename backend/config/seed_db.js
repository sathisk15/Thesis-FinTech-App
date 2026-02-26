/**
 * ======================================
 * SEED SCRIPT – SINGLE FILE OUTLINE
 * ======================================
 */

/**
 * Helpers
 */

const transactionPlan = {
  daily: {
    business: {
      income: [
        {
          note: 'Order placed',
          minCount: 10,
          maxCount: 120,
          minAmount: 10,
          maxAmount: 300,
        },
      ],
      expense: [
        {
          note: 'Advertisement expense',
          minCount: 2,
          maxCount: 5,
          minAmount: 20,
          maxAmount: 200,
        },
        {
          note: 'Courier and shipping charges',
          minCount: 5,
          maxCount: 20,
          minAmount: 5,
          maxAmount: 40,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Order refund',
            minCount: 0,
            maxCount: 3,
            minAmount: 10,
            maxAmount: 300,
          },
          {
            note: 'Extra advertisement spend',
            minCount: 0,
            maxCount: 1,
            minAmount: 50,
            maxAmount: 500,
          },
          {
            note: 'Additional logistics charges',
            minCount: 0,
            maxCount: 2,
            minAmount: 10,
            maxAmount: 100,
          },
        ],
      },
    },

    current: {
      income: [],
      expense: [
        {
          note: 'Food and meals',
          minCount: 2,
          maxCount: 3,
          minAmount: 3,
          maxAmount: 20,
        },
        {
          note: 'Transportation expense',
          minCount: 1,
          maxCount: 2,
          minAmount: 2,
          maxAmount: 15,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Dining outside',
            minCount: 0,
            maxCount: 1,
            minAmount: 10,
            maxAmount: 40,
          },
          {
            note: 'Online shopping',
            minCount: 0,
            maxCount: 1,
            minAmount: 15,
            maxAmount: 150,
          },
          {
            note: 'Minor repair expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 20,
            maxAmount: 80,
          },
        ],
      },
    },

    savings: {
      income: [],
      expense: [],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Emergency withdrawal',
            minCount: 0,
            maxCount: 1,
            minAmount: 200,
            maxAmount: 2000,
          },
        ],
      },
    },
  },

  monthly: {
    business: {
      income: [],
      expense: [
        {
          note: 'Employee salary',
          minCount: 1,
          maxCount: 1,
          minAmount: 800,
          maxAmount: 3000,
        },
        {
          note: 'SaaS and platform charges',
          minCount: 1,
          maxCount: 3,
          minAmount: 50,
          maxAmount: 400,
        },
        {
          note: 'Office rent',
          minCount: 1,
          maxCount: 1,
          minAmount: 300,
          maxAmount: 1500,
        },
        {
          note: 'Owner salary transfer',
          minCount: 1,
          maxCount: 1,
          minAmount: 10000,
          maxAmount: 15000,
        },
        {
          note: 'Tax reserve allocation',
          minCount: 1,
          maxCount: 1,
          minAmount: 200,
          maxAmount: 2000,
        },
        {
          note: 'Payment gateway fees',
          minCount: 10,
          maxCount: 120,
          minAmount: 30,
          maxAmount: 150,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Platform penalty',
            minCount: 0,
            maxCount: 1,
            minAmount: 50,
            maxAmount: 500,
          },
          {
            note: 'Bulk order refunds',
            minCount: 0,
            maxCount: 1,
            minAmount: 100,
            maxAmount: 2000,
          },
          {
            note: 'Infrastructure upgrade',
            minCount: 0,
            maxCount: 1,
            minAmount: 300,
            maxAmount: 5000,
          },
        ],
      },
    },

    current: {
      income: [
        {
          note: 'Salary received',
          minCount: 1,
          maxCount: 1,
          minAmount: 1000,
          maxAmount: 4000,
        },
      ],
      expense: [
        {
          note: 'House rent',
          minCount: 1,
          maxCount: 1,
          minAmount: 300,
          maxAmount: 1200,
        },
        {
          note: 'Utility bills',
          minCount: 2,
          maxCount: 4,
          minAmount: 50,
          maxAmount: 300,
        },
        {
          note: 'Subscription services',
          minCount: 3,
          maxCount: 6,
          minAmount: 10,
          maxAmount: 100,
        },
        {
          note: 'Insurance premium',
          minCount: 1,
          maxCount: 1,
          minAmount: 50,
          maxAmount: 300,
        },
        {
          note: 'Savings deposit',
          minCount: 1,
          maxCount: 2,
          minAmount: 100,
          maxAmount: 1000,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Medical expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 50,
            maxAmount: 800,
          },
          {
            note: 'Family event expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 100,
            maxAmount: 1500,
          },
          {
            note: 'Device repair',
            minCount: 0,
            maxCount: 1,
            minAmount: 50,
            maxAmount: 500,
          },
        ],
      },
    },

    savings: {
      income: [
        {
          note: 'Profit transferred to savings',
          minCount: 1,
          maxCount: 2,
          minAmount: 30000,
          maxAmount: 50000,
        },
        {
          note: 'Interest credited',
          minCount: 1,
          maxCount: 1,
          minAmount: 5,
          maxAmount: 80,
        },
      ],
      expense: [],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Large withdrawal',
            minCount: 0,
            maxCount: 1,
            minAmount: 500,
            maxAmount: 5000,
          },
          {
            note: 'One-time investment',
            minCount: 0,
            maxCount: 1,
            minAmount: 500,
            maxAmount: 10000,
          },
        ],
      },
    },
  },

  yearly: {
    business: {
      income: [],
      expense: [
        {
          note: 'Annual business tax',
          minCount: 1,
          maxCount: 1,
          minAmount: 2000,
          maxAmount: 20000,
        },
        {
          note: 'Audit and accounting fees',
          minCount: 1,
          maxCount: 1,
          minAmount: 300,
          maxAmount: 3000,
        },
        {
          note: 'License renewal',
          minCount: 1,
          maxCount: 1,
          minAmount: 100,
          maxAmount: 1000,
        },
        {
          note: 'Employee bonus',
          minCount: 1,
          maxCount: 1,
          minAmount: 500,
          maxAmount: 8000,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Legal expenses',
            minCount: 0,
            maxCount: 1,
            minAmount: 500,
            maxAmount: 10000,
          },
          {
            note: 'System migration',
            minCount: 0,
            maxCount: 1,
            minAmount: 1000,
            maxAmount: 20000,
          },
          {
            note: 'Fraud-related loss',
            minCount: 0,
            maxCount: 1,
            minAmount: 100,
            maxAmount: 5000,
          },
        ],
      },
    },

    current: {
      income: [],
      expense: [
        {
          note: 'Vacation expenses',
          minCount: 1,
          maxCount: 2,
          minAmount: 500,
          maxAmount: 5000,
        },
        {
          note: 'Personal device purchase',
          minCount: 1,
          maxCount: 1,
          minAmount: 600,
          maxAmount: 3000,
        },
        {
          note: 'Insurance renewal',
          minCount: 1,
          maxCount: 1,
          minAmount: 200,
          maxAmount: 1500,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Major medical expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 1000,
            maxAmount: 20000,
          },
          {
            note: 'Wedding or family event',
            minCount: 0,
            maxCount: 1,
            minAmount: 2000,
            maxAmount: 25000,
          },
          {
            note: 'Vehicle expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 500,
            maxAmount: 8000,
          },
        ],
      },
    },

    savings: {
      income: [
        {
          note: 'Annual tax refund',
          minCount: 0,
          maxCount: 1,
          minAmount: 200,
          maxAmount: 3000,
        },
      ],
      expense: [
        {
          note: 'Annual tax payment',
          minCount: 1,
          maxCount: 1,
          minAmount: 1000,
          maxAmount: 15000,
        },
        {
          note: 'Long-term investment',
          minCount: 1,
          maxCount: 2,
          minAmount: 1000,
          maxAmount: 20000,
        },
      ],
      unexpected: {
        income: [],
        expense: [
          {
            note: 'Business support transfer',
            minCount: 0,
            maxCount: 1,
            minAmount: 1000,
            maxAmount: 15000,
          },
          {
            note: 'Large emergency expense',
            minCount: 0,
            maxCount: 1,
            minAmount: 2000,
            maxAmount: 30000,
          },
        ],
      },
    },
  },
};

const transactionTypesMap = {
  'Order placed': [
    'Electronics',
    'Fashion',
    'Home appliances',
    'Books',
    'Beauty products',
    'Sports equipment',
  ],

  'Advertisement expense': [
    'Google Ads',
    'Meta Ads',
    'Instagram promotions',
    'Influencer marketing',
    'Affiliate campaigns',
  ],

  'Courier and shipping charges': [
    'Standard delivery',
    'Express delivery',
    'International shipping',
    'Return shipping',
  ],

  'Order refund': [
    'Customer cancellation',
    'Damaged product',
    'Delivery delay',
    'Incorrect item delivered',
  ],

  'Extra advertisement spend': [
    'Flash sale boost',
    'Festival campaign',
    'Low conversion recovery',
    'Competitor campaign response',
  ],

  'Additional logistics charges': [
    'Return pickup',
    'Re-shipping',
    'Warehouse handling',
    'Customs clearance',
  ],

  'Food and meals': [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Fine dining restaurant',
    'Michelin-star restaurant',
    'Private chef experience',
    'Luxury wine & gourmet tasting',
  ],

  'Transportation expense': [
    'Luxury car rental',
    'Chauffeur-driven car',
    'Business class flight',
    'First class flight',
  ],

  'Dining outside': [
    'Restaurant',
    'Cafe',
    'Food delivery',
    'Takeaway',
    'Rooftop luxury restaurant',
    'Private dining lounge',
    'Sea-view fine dining',
  ],

  'Online shopping': [
    'Clothing',
    'Electronics',
    'Accessories',
    'Home items',
    'Designer clothing',
    'Luxury watches',
    'Premium gadgets',
    'High-end home décor',
  ],

  'Minor repair expense': [
    'Plumbing',
    'Electrical',
    'Appliance repair',
    'Furniture repair',
  ],

  'Emergency withdrawal': [
    'Medical emergency',
    'Family emergency',
    'Urgent travel',
  ],

  'Employee salary': [
    'Full-time staff',
    'Part-time staff',
    'Contractor payment',
  ],

  'SaaS and platform charges': [
    'Hosting services',
    'E-commerce platform',
    'Analytics tools',
    'Email marketing tools',
  ],

  'Office rent': ['Office space', 'Warehouse rent', 'Co-working space'],

  'Owner salary transfer': ['Monthly salary', 'Performance-based payout'],

  'Tax reserve allocation': [
    'Income tax reserve',
    'VAT reserve',
    'Corporate tax reserve',
  ],

  'Payment gateway fees': ['Stripe', 'Adyen', 'PayPal', 'Mollie'],

  'Platform penalty': [
    'Policy violation',
    'Late shipment penalty',
    'Quality issue penalty',
  ],

  'Bulk order refunds': [
    'Product recall',
    'Supplier defect',
    'Campaign failure',
  ],

  'Infrastructure upgrade': [
    'Server scaling',
    'Database upgrade',
    'Security enhancement',
  ],

  'Salary received': ['Monthly salary', 'Bonus payout'],

  'House rent': ['Apartment rent', 'Maintenance charges'],

  'Utility bills': ['Electricity', 'Water', 'Internet', 'Gas'],

  'Subscription services': [
    'Streaming services',
    'Cloud storage',
    'Productivity tools',
  ],

  'Insurance premium': [
    'Health insurance',
    'Life insurance',
    'Vehicle insurance',
  ],

  'Savings deposit': ['Monthly savings', 'Surplus transfer'],

  'Medical expense': [
    'Doctor consultation',
    'Medicines',
    'Lab tests',
    'Dental treatment',
  ],

  'Family event expense': [
    'Birthday celebration',
    'Religious ceremony',
    'Family gathering',
  ],

  'Device repair': ['Mobile repair', 'Laptop repair', 'Accessory replacement'],

  'Profit transferred to savings': [
    'Monthly profit allocation',
    'Quarterly profit allocation',
  ],

  'Interest credited': ['Savings account interest', 'Fixed deposit interest'],

  'Large withdrawal': [
    'Emergency expense',
    'Investment funding',
    'Major purchase',
  ],

  'One-time investment': [
    'Stocks',
    'Mutual funds',
    'Crypto assets',
    'Fixed deposits',
  ],

  'Annual business tax': ['Corporate income tax', 'VAT settlement'],

  'Audit and accounting fees': [
    'Annual audit',
    'Tax filing',
    'Compliance review',
  ],

  'License renewal': ['Business license', 'Trade license', 'Software license'],

  'Employee bonus': ['Performance bonus', 'Year-end bonus'],

  'Legal expenses': [
    'Contract dispute',
    'Compliance issue',
    'Legal consultation',
  ],

  'System migration': [
    'Cloud migration',
    'Platform re-architecture',
    'Payment system migration',
  ],

  'Fraud-related loss': [
    'Chargeback fraud',
    'Account compromise',
    'Payment fraud',
  ],

  'Vacation expenses': [
    'Flights',
    'Hotels',
    'Local travel',
    'Leisure activities',
  ],

  'Personal device purchase': [
    'Mobile phone',
    'Laptop',
    'Tablet',
    'Accessories',
  ],

  'Insurance renewal': [
    'Health insurance',
    'Life insurance',
    'Vehicle insurance',
  ],

  'Major medical expense': [
    'Surgery',
    'Hospitalization',
    'Accident treatment',
    'Chronic illness care',
  ],

  'Wedding or family event': [
    'Wedding ceremony',
    'Reception',
    'Cultural event',
  ],

  'Vehicle expense': [
    'Major repair',
    'Vehicle replacement',
    'Insurance claim excess',
  ],

  'Annual tax refund': ['Income tax refund', 'VAT refund'],

  'Annual tax payment': ['Personal income tax', 'Capital gains tax'],

  'Long-term investment': ['Fixed deposits', 'Real estate', 'Retirement fund'],

  'Business support transfer': ['Cash flow support', 'Emergency funding'],

  'Large emergency expense': [
    'Medical emergency',
    'Legal emergency',
    'Disaster recovery',
  ],
};

const yearOverYearGrowthMap = {
  business: {
    income: {
      'Order placed': {
        countGrowth: 0.15, // +15% orders per year
        amountGrowth: 0.05, // +5% AOV per year
      },
    },

    expense: {
      'Advertisement expense': {
        countGrowth: 0.1,
        amountGrowth: 0.08,
      },
      'Courier and shipping charges': {
        countGrowth: 0.12,
        amountGrowth: 0.04,
      },
      'Payment gateway fees': {
        countGrowth: 0.12,
        amountGrowth: 0.03,
      },
      'Employee salary': {
        countGrowth: 0.0, // headcount stable
        amountGrowth: 0.07, // annual raises
      },
      'Office rent': {
        countGrowth: 0.0,
        amountGrowth: 0.04,
      },
      'SaaS and platform charges': {
        countGrowth: 0.05,
        amountGrowth: 0.06,
      },
      'Tax reserve allocation': {
        countGrowth: 0.0,
        amountGrowth: 0.1,
      },
    },

    unexpected: {
      'Order refund': {
        probabilityGrowth: 0.02, // refunds slightly more likely
        amountGrowth: 0.05,
      },
      'Bulk order refunds': {
        probabilityGrowth: 0.01,
        amountGrowth: 0.08,
      },
    },
  },

  current: {
    income: {
      'Salary received': {
        countGrowth: 0.0,
        amountGrowth: 0.08,
      },
    },

    expense: {
      'Food and meals': {
        countGrowth: 0.0,
        amountGrowth: 0.05,
      },
      'Transportation expense': {
        countGrowth: 0.0,
        amountGrowth: 0.04,
      },
      'House rent': {
        countGrowth: 0.0,
        amountGrowth: 0.06,
      },
      'Utility bills': {
        countGrowth: 0.0,
        amountGrowth: 0.05,
      },
      'Subscription services': {
        countGrowth: 0.03,
        amountGrowth: 0.05,
      },
      'Insurance premium': {
        countGrowth: 0.0,
        amountGrowth: 0.06,
      },
    },

    unexpected: {
      'Medical expense': {
        probabilityGrowth: 0.02,
        amountGrowth: 0.06,
      },
      'Family event expense': {
        probabilityGrowth: 0.01,
        amountGrowth: 0.05,
      },
    },
  },

  savings: {
    income: {
      'Profit transferred to savings': {
        countGrowth: 0.05,
        amountGrowth: 0.15,
      },
      'Interest credited': {
        countGrowth: 0.0,
        amountGrowth: 0.1,
      },
    },

    expense: {
      'Long-term investment': {
        countGrowth: 0.05,
        amountGrowth: 0.12,
      },
    },

    unexpected: {
      'Large withdrawal': {
        probabilityGrowth: 0.01,
        amountGrowth: 0.08,
      },
    },
  },
};

const monthlyOrderAdjustment = {
  Jan: -0.12,
  Feb: -0.08,
  Mar: 0.0,
  Apr: 0.05,
  May: 0.08,
  Jun: 0.12,
  Jul: 0.1,
  Aug: -0.05,
  Sep: 0.06,
  Oct: 0.15,
  Nov: 0.35,
  Dec: 0.5,
};

const transactionPrimaryHourMap = {
  // ---------- DAILY · BUSINESS ----------
  'Order placed': [9, 23],
  'Advertisement expense': [6, 10],
  'Courier and shipping charges': [9, 17],
  'Order refund': [11, 17],
  'Extra advertisement spend': [18, 22],
  'Additional logistics charges': [10, 18],

  // ---------- DAILY · CURRENT ----------
  'Food and meals': [12, 14],
  'Transportation expense': [8, 10],
  'Dining outside': [19, 23],
  'Online shopping': [20, 23],
  'Minor repair expense': [10, 18],

  // ---------- DAILY · SAVINGS ----------
  'Emergency withdrawal': [9, 17],

  // ---------- MONTHLY · BUSINESS ----------
  'Employee salary': [1, 4],
  'SaaS and platform charges': [2, 6],
  'Office rent': [8, 11],
  'Owner salary transfer': [1, 5],
  'Tax reserve allocation': [9, 16],
  'Payment gateway fees': [1, 5],
  'Platform penalty': [10, 16],
  'Bulk order refunds': [11, 17],
  'Infrastructure upgrade': [10, 18],

  // ---------- MONTHLY · CURRENT ----------
  'Salary received': [0, 3],
  'House rent': [8, 11],
  'Utility bills': [1, 6],
  'Subscription services': [1, 5],
  'Insurance premium': [2, 6],
  'Savings deposit': [1, 5],
  'Medical expense': [10, 20],
  'Family event expense': [10, 18],
  'Device repair': [10, 18],

  // ---------- MONTHLY · SAVINGS ----------
  'Profit transferred to savings': [1, 5],
  'Interest credited': [2, 6],
  'Large withdrawal': [9, 17],
  'One-time investment': [10, 16],

  // ---------- YEARLY · BUSINESS ----------
  'Annual business tax': [9, 15],
  'Audit and accounting fees': [10, 16],
  'License renewal': [9, 14],
  'Employee bonus': [1, 5],
  'Legal expenses': [10, 16],
  'System migration': [22, 4], // overnight window
  'Fraud-related loss': [0, 23],

  // ---------- YEARLY · CURRENT ----------
  'Vacation expenses': [9, 21],
  'Personal device purchase': [11, 20],
  'Insurance renewal': [2, 6],
  'Major medical expense': [0, 23],
  'Wedding or family event': [10, 22],
  'Vehicle expense': [9, 18],

  // ---------- YEARLY · SAVINGS ----------
  'Annual tax refund': [1, 5],
  'Annual tax payment': [9, 15],
  'Long-term investment': [10, 16],
  'Business support transfer': [9, 17],
  'Large emergency expense': [0, 23],
};

const orderItemCatalog = {
  Electronics: {
    weight: 0.22,
    price: { min: 120, max: 1200 },
    items: [
      'Smartphone',
      'Laptop',
      'Wireless Earbuds',
      'Smart Watch',
      'Bluetooth Speaker',
      'Tablet',
      'Gaming Console',
      'Power Bank',
    ],
  },

  Fashion: {
    weight: 0.28,
    price: { min: 15, max: 180 },
    items: [
      'T-Shirt',
      'Jeans',
      'Sneakers',
      'Jacket',
      'Dress',
      'Handbag',
      'Sunglasses',
      'Watch',
    ],
  },

  HomeAppliances: {
    weight: 0.14,
    price: { min: 40, max: 600 },
    items: [
      'Microwave Oven',
      'Vacuum Cleaner',
      'Mixer Grinder',
      'Air Fryer',
      'Coffee Maker',
      'Electric Kettle',
    ],
  },

  Books: {
    weight: 0.12,
    price: { min: 8, max: 45 },
    items: [
      'Programming Book',
      'Self-help Book',
      'Novel',
      'Business Book',
      'Exam Guide',
      'Biography',
    ],
  },

  BeautyProducts: {
    weight: 0.16,
    price: { min: 10, max: 120 },
    items: [
      'Perfume',
      'Face Cream',
      'Serum',
      'Shampoo',
      'Makeup Kit',
      'Hair Dryer',
    ],
  },

  SportsEquipment: {
    weight: 0.08,
    price: { min: 30, max: 350 },
    items: [
      'Football',
      'Cricket Bat',
      'Yoga Mat',
      'Dumbbells',
      'Running Shoes',
      'Tennis Racket',
    ],
  },
};

function convertCentsToEuro(cents) {
  return cents / 100;
}

function convertEuroToCents(euro) {
  return Math.round(euro * 100);
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function pickWeightedCategory(catalog) {
  const entries = Object.entries(catalog);
  const totalWeight = entries.reduce((s, [, v]) => s + v.weight, 0);

  let r = Math.random() * totalWeight;

  for (const [key, value] of entries) {
    if (r < value.weight) return { key, value };
    r -= value.weight;
  }
}

function generateAndInsertTransactions({
  rule,
  flowType,
  accountKey,
  accountId,
  db,
  state,
  userId,
  dateParts,
}) {
  const count = getRandomInt(rule.minCount, rule.maxCount);
  const [startHour, endHour] = transactionPrimaryHourMap[rule.note] || [9, 17];
  const subTypes = transactionTypesMap[rule.note] || [];

  for (let i = 0; i < count; i++) {
    const hour = getRandomInt(startHour, endHour);
    const minute = getRandomInt(0, 59);

    const date = `${dateParts.year}-${String(dateParts.month).padStart(
      2,
      '0',
    )}-${String(dateParts.day).padStart(
      2,
      '0',
    )} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    const amountEuro = getRandomFloat(rule.minAmount, rule.maxAmount);

    const subType =
      subTypes.length > 0
        ? subTypes[getRandomInt(0, subTypes.length - 1)]
        : null;

    addTransaction({
      db,
      state,
      userId,
      accountId,
      amountCents: convertEuroToCents(amountEuro),
      type: flowType === 'income' ? 'credit' : 'debit',
      category: `${accountKey}-${flowType}`,
      description: subType ? `${rule.note} · ${subType}` : rule.note,
      date,
    });
  }
}

function runMonthlyRules({
  rules,
  flowType,
  accountId,
  accountKey,
  db,
  state,
  userId,
  year,
  month,
}) {
  for (const rule of rules) {
    const count = getRandomInt(rule.minCount, rule.maxCount);
    const [startHour, endHour] = transactionPrimaryHourMap[rule.note] || [
      9, 17,
    ];

    const subTypes = transactionTypesMap[rule.note] || [];

    for (let i = 0; i < count; i++) {
      const day = getRandomInt(1, 5); // early-month realism
      const hour = getRandomInt(startHour, endHour);
      const minute = getRandomInt(0, 59);

      const date = `${year}-${String(month).padStart(
        2,
        '0',
      )}-${String(day).padStart(2, '0')} ${String(hour).padStart(
        2,
        '0',
      )}:${String(minute).padStart(2, '0')}:00`;

      const amountEuro = getRandomFloat(rule.minAmount, rule.maxAmount);

      const subType =
        subTypes.length > 0
          ? subTypes[getRandomInt(0, subTypes.length - 1)]
          : null;

      addTransaction({
        db,
        state,
        userId,
        accountId,
        amountCents: convertEuroToCents(amountEuro),
        type: flowType === 'income' ? 'credit' : 'debit',
        category: `${accountKey}-${flowType}-monthly`,
        description: subType ? `${rule.note} · ${subType}` : rule.note,
        date,
      });
    }
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function applyYearlyGrowth(basePlan, growthMap) {
  const plan = deepClone(basePlan);

  for (const accountKey of Object.keys(growthMap)) {
    const accountGrowth = growthMap[accountKey];

    for (const period of ['daily', 'monthly', 'yearly']) {
      const periodPlan = plan[period]?.[accountKey];
      if (!periodPlan) continue;

      for (const section of ['income', 'expense']) {
        const rules = periodPlan[section] || [];
        const growthRules = accountGrowth[section] || {};

        for (const rule of rules) {
          const growth = growthRules[rule.note];
          if (!growth) continue;

          if (growth.countGrowth) {
            rule.minCount = Math.round(
              rule.minCount * (1 + growth.countGrowth),
            );
            rule.maxCount = Math.round(
              rule.maxCount * (1 + growth.countGrowth),
            );
          }

          if (growth.amountGrowth) {
            rule.minAmount = +(
              rule.minAmount *
              (1 + growth.amountGrowth)
            ).toFixed(2);
            rule.maxAmount = +(
              rule.maxAmount *
              (1 + growth.amountGrowth)
            ).toFixed(2);
          }
        }
      }
    }
  }

  return plan;
}
/**
 * Imports & setup
 */
import db from '../db/db.js';
import bcrypt from 'bcrypt';

/**
 * Reset database
 */
function resetDatabase(db) {
  console.log('Resetting database');

  db.exec(`
    DELETE FROM tbltransaction;
    DELETE FROM tblaccount;
    DELETE FROM tbluser;
  `);

  console.log('completed');
}
/**
 * Create user
 */
function createUser(db) {
  console.log('👤 STEP 2: Creating user');

  const USER = {
    email: 'sathis@gmail.com',
    firstname: 'Sathiskumar',
    lastname: 'Ravichandran',
    contact: '+48 989876972',
    password: '123',
    provider: 'local',
    country: 'Poland',
    currency: 'EUR',
  };

  const hashedPassword = bcrypt.hashSync(USER.password, 10);

  const stmt = db.prepare(`
    INSERT INTO tbluser
    (email, firstname, lastname, contact, password, provider, country, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    USER.email,
    USER.firstname,
    USER.lastname,
    USER.contact,
    hashedPassword,
    USER.provider,
    USER.country,
    USER.currency,
  );

  console.log('✅ STEP 2 completed. User ID:', result.lastInsertRowid);

  return result.lastInsertRowid;
}

/**
 * Create accounts
 */
function createAccounts(db, userId) {
  console.log('🏦 STEP 3: Creating accounts');

  const ACCOUNTS = [
    { type: 'Business', balance: 500000 },
    { type: 'Savings', balance: 1000000 },
    { type: 'Current', balance: 300000 },
  ];

  const stmt = db.prepare(`
    INSERT INTO tblaccount
    (user_id, account_type, account_number, currency, account_balance)
    VALUES (?, ?, ?, ?, ?)
  `);

  const generateAccountNumber = () =>
    'AC' + Math.floor(10000000 + Math.random() * 90000000);

  const result = {};

  for (const acc of ACCOUNTS) {
    const res = stmt.run(
      userId,
      acc.type,
      generateAccountNumber(),
      'EUR',
      acc.balance,
    );

    result[acc.type.toLowerCase()] = res.lastInsertRowid;

    console.log(
      `✅ ${acc.type} account created. ID: ${res.lastInsertRowid}, Balance: ${acc.balance}`,
    );
  }

  return {
    businessId: result.business,
    savingsId: result.savings,
    currentId: result.current,
  };
}

/**
 * Initialize runtime state (in-memory balances in cents)
 */
function initState(accounts) {
  console.log('🧠 STEP 4: Initializing runtime state');

  // IMPORTANT:
  // These balances must MATCH what you inserted in STEP 3
  const INITIAL_BALANCES = {
    business: 500000,
    savings: 1000000,
    current: 300000,
  };

  const state = {
    [accounts.businessId]: INITIAL_BALANCES.business * 100,
    [accounts.savingsId]: INITIAL_BALANCES.savings * 100,
    [accounts.currentId]: INITIAL_BALANCES.current * 100,
  };

  console.log('✅ STEP 4 completed. Initial state:', state);

  return state;
}

/**
 * Add initial capital transactions
 */
function addInitialCapital(db, state, userId, accounts) {
  console.log('💰 STEP 5: Adding initial capital transactions');

  const stmt = db.prepare(`
    INSERT INTO tbltransaction
    (
      user_id,
      account_id,
      description,
      reference,
      amount,
      type,
      balance_before,
      balance_after,
      status,
      category,
      createdat
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = '2021-01-01 09:00:00';

  const entries = [
    { accountId: accounts.businessId, name: 'Business' },
    { accountId: accounts.savingsId, name: 'Savings' },
    { accountId: accounts.currentId, name: 'Current' },
  ];

  for (const entry of entries) {
    const balanceCents = state[entry.accountId];

    const amountEuro = convertCentsToEuro(balanceCents);

    stmt.run(
      userId,
      entry.accountId,
      'Initial Capital',
      `INIT-${entry.name.toUpperCase()}`,
      amountEuro, // EUR
      'credit',
      0,
      amountEuro,
      'Completed',
      'Capital',
      now,
    );

    console.log(`✅ ${entry.name} initial capital recorded: €${amountEuro}`);
  }

  console.log('✅ STEP 5 completed');
}

/**
 * Core transaction helper
 */
function addTransaction({
  db,
  state,
  userId,
  accountId,
  amountCents,
  type, // 'credit' | 'debit'
  category,
  description,
  date,
}) {
  const before = state[accountId];

  if (type === 'credit') {
    state[accountId] += amountCents;
  } else {
    state[accountId] -= amountCents;
  }

  const after = state[accountId];

  const stmt = db.prepare(`
    INSERT INTO tbltransaction
    (
      user_id,
      account_id,
      description,
      reference,
      amount,
      type,
      balance_before,
      balance_after,
      status,
      category,
      createdat
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userId,
    accountId,
    description,
    `${category}-${Date.now()}`,
    convertCentsToEuro(amountCents),
    type,
    convertCentsToEuro(before),
    convertCentsToEuro(after),
    'Completed',
    category,
    date,
  );
}

function runOneDay(db, state, userId, accounts, { year, month, day }, plan) {
  const dailyPlan = plan.daily;

  const ACCOUNT_MAP = {
    business: accounts.businessId,
    current: accounts.currentId,
    savings: accounts.savingsId,
  };

  for (const accountKey of Object.keys(dailyPlan)) {
    const accountId = ACCOUNT_MAP[accountKey];
    const accountPlan = dailyPlan[accountKey];

    // ---------- INCOME & EXPENSE ----------
    for (const flowType of ['income', 'expense']) {
      const rules = accountPlan[flowType] || [];

      for (const rule of rules) {
        // ⭐ SPECIAL HANDLING: ORDER PLACED
        if (rule.note === 'Order placed') {
          const count = getRandomInt(rule.minCount, rule.maxCount);
          const [startHour, endHour] =
            transactionPrimaryHourMap['Order placed'];

          for (let i = 0; i < count; i++) {
            const { key, value } = pickWeightedCategory(orderItemCatalog);

            const item = value.items[getRandomInt(0, value.items.length - 1)];

            const amountEuro = getRandomFloat(value.price.min, value.price.max);

            const hour = getRandomInt(startHour, endHour);
            const minute = getRandomInt(0, 59);

            const date = `${year}-${String(month).padStart(
              2,
              '0',
            )}-${String(day).padStart(2, '0')} ${String(hour).padStart(
              2,
              '0',
            )}:${String(minute).padStart(2, '0')}:00`;

            addTransaction({
              db,
              state,
              userId,
              accountId,
              amountCents: convertEuroToCents(amountEuro),
              type: 'credit',
              category: 'business-income',
              description: `Order placed · ${key} · ${item}`,
              date,
            });
          }

          continue;
        }

        // ---------- NORMAL DAILY RULES ----------
        generateAndInsertTransactions({
          rule,
          flowType,
          accountKey,
          accountId,
          db,
          state,
          userId,
          dateParts: { year, month, day },
        });
      }
    }

    // ---------- UNEXPECTED ----------
    const unexpected = accountPlan.unexpected || {};
    for (const flowType of ['income', 'expense']) {
      const rules = unexpected[flowType] || [];

      for (const rule of rules) {
        generateAndInsertTransactions({
          rule,
          flowType,
          accountKey,
          accountId,
          db,
          state,
          userId,
          dateParts: { year, month, day },
        });
      }
    }
  }
}

function runMonthlySimulation(
  db,
  state,
  userId,
  accounts,
  { year, month, plan },
) {
  console.log(`📆 Running monthly simulation: ${year}-${month}`);

  const daysInMonth = getDaysInMonth(year, month);

  // ---------- DAILY SIMULATION ----------
  for (let day = 1; day <= daysInMonth; day++) {
    runOneDay(db, state, userId, accounts, { year, month, day }, plan);
  }

  // ---------- MONTHLY RULES ----------
  const monthlyPlan = plan.monthly;

  const ACCOUNT_MAP = {
    business: accounts.businessId,
    current: accounts.currentId,
    savings: accounts.savingsId,
  };

  for (const accountKey of Object.keys(monthlyPlan)) {
    const accountId = ACCOUNT_MAP[accountKey];
    const plan = monthlyPlan[accountKey];

    // income & expense
    for (const flowType of ['income', 'expense']) {
      const rules = plan[flowType] || [];

      runMonthlyRules({
        rules,
        flowType,
        accountId,
        accountKey,
        db,
        state,
        userId,
        year,
        month,
      });
    }

    // unexpected
    const unexpected = plan.unexpected || {};
    for (const flowType of ['income', 'expense']) {
      const rules = unexpected[flowType] || [];

      runMonthlyRules({
        rules,
        flowType,
        accountId,
        accountKey,
        db,
        state,
        userId,
        year,
        month,
      });
    }
  }

  console.log(`✅ Monthly simulation completed`);
}

function runYearlySimulation(
  db,
  state,
  userId,
  accounts,
  { startYear, years },
) {
  console.log(`📅 Running ${years}-year simulation starting ${startYear}`);

  let currentPlan = deepClone(transactionPlan);

  for (let i = 0; i < years; i++) {
    const year = startYear + i;

    console.log(`➡️ Year ${year}`);

    for (let month = 1; month <= 12; month++) {
      runMonthlySimulation(db, state, userId, accounts, {
        year,
        month,
        plan: currentPlan,
      });
    }
    const yearlyPlan = currentPlan.yearly;
    const ACCOUNT_MAP = {
      business: accounts.businessId,
      current: accounts.currentId,
      savings: accounts.savingsId,
    };

    for (const accountKey of Object.keys(yearlyPlan)) {
      const accountId = ACCOUNT_MAP[accountKey];
      const plan = yearlyPlan[accountKey];

      for (const flowType of ['income', 'expense']) {
        const rules = plan[flowType] || [];

        for (const rule of rules) {
          const count = getRandomInt(rule.minCount, rule.maxCount);

          for (let i = 0; i < count; i++) {
            const amountEuro = getRandomFloat(rule.minAmount, rule.maxAmount);

            addTransaction({
              db,
              state,
              userId,
              accountId,
              amountCents: convertEuroToCents(amountEuro),
              type: flowType === 'income' ? 'credit' : 'debit',
              category: `${accountKey}-${flowType}-yearly`,
              description: rule.note,
              date: `${year}-12-31 12:00:00`,
            });
          }
        }
      }
    }
    currentPlan = applyYearlyGrowth(currentPlan, yearOverYearGrowthMap);
  }

  console.log(`✅ ${years}-year simulation completed`);
}

function persistFinalBalances(db, state) {
  console.log('💾 Persisting final account balances');

  const stmt = db.prepare(`
    UPDATE tblaccount
    SET account_balance = ?
    WHERE id = ?
  `);

  for (const [accountId, balanceCents] of Object.entries(state)) {
    const balanceEuro = convertCentsToEuro(balanceCents);

    stmt.run(balanceEuro, accountId);

    console.log(
      `✅ Account ${accountId} final balance updated: €${balanceEuro.toFixed(
        2,
      )}`,
    );
  }

  console.log('✅ Final balances persisted');
}

function seed() {
  db.transaction(() => {
    resetDatabase(db);
    const userId = createUser(db);
    const accounts = createAccounts(db, userId);
    const state = initState(accounts);
    addInitialCapital(db, state, userId, accounts);
    runYearlySimulation(db, state, userId, accounts, {
      startYear: 2021,
      years: 5,
    });
    persistFinalBalances(db, state);
  })();
}

seed();
