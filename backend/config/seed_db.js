import db from '../db/db.js';
import bcrypt from 'bcrypt';

console.log('🌱 Starting database seed...');

/**
 * =========================
 * CONFIG (ALL HARDCODED VALUES)
 * =========================
 */
const CONFIG = {
  USER: {
    EMAIL: 'richuser@test.com',
    FIRSTNAME: 'Rich',
    LASTNAME: 'Owner',
    CONTACT: '999999999',
    PASSWORD: '123',
    PROVIDER: 'local',
    COUNTRY: 'Poland',
    CURRENCY: 'EUR',
  },

  INITIAL_BALANCES: {
    BUSINESS: 120000000,
    SAVINGS: 100000000,
    CURRENT: 30000000,
  },

  ACCOUNT_TYPES: {
    BUSINESS: 'Business',
    SAVINGS: 'Savings',
    CURRENT: 'Current',
  },

  SIMULATION: {
    START_YEAR: 2021,
    START_MONTH: 3,
    MONTHS: 60,
    BASE_REVENUE: 1_000_000,
  },

  CAPITAL: {
    DESCRIPTION: 'Initial Capital Deposit',
    REFERENCE: 'CAPITAL-2021',
    DATE: '2021-03-01 09:00:00',
    CATEGORY: 'Capital',
    STATUS: 'Completed',
  },

  TRANSACTION: {
    STATUS: 'Completed',
    CURRENCY: 'EUR',
  },

  COSTS: {
    FEES_RATE: 0.025,
    MARKETING_RATE: 0.1,
    BASE_PAYROLL: 150000,
    PAYROLL_INCREMENT: 20000,
    BASE_OPERATIONS: 30000,
    OPERATIONS_INCREMENT: 5000,
    SAVINGS_TRANSFER_RATE: 0.2,
    CURRENT_TRANSFER_RATE: 0.1,
  },

  REFUND_RATES: {
    JAN_MIN: 0.05,
    JAN_MAX: 0.09,
    OTHER_MIN: 0.02,
    OTHER_MAX: 0.06,
  },

  RANDOMNESS: {
    DAILY_MIN: 0.85,
    DAILY_MAX: 1.15,
    MONTHLY_MIN: 0.97,
    MONTHLY_MAX: 1.03,
  },

  SEASONAL_MULTIPLIER: {
    JAN: 0.9,
    SUMMER: 1.05,
    NOV: 1.3,
    DEC: 1.25,
  },

  CRISIS: {
    YEAR: 2023,
    START_MONTH: 6,
    END_MONTH: 11,
    IMPACT: 0.82,
  },
};

const channelByProduct = [
  {
    channel: 'Website – Organic',
    products: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Smartwatches',
      'Wireless Earbuds',
      'Bluetooth Headphones',
      'Mechanical Keyboards',
      'Wireless Mouse',
      'Backpacks',
      'Desk Accessories',
      'Online Courses',
      'E-Books',
      'MacBook Pro',
      'Ultrabook Laptop',
      '4K Monitor',
      'Noise Cancelling Headphones',
      'Premium Mechanical Keyboard',
      'Ergonomic Office Chair',
    ],
  },
  {
    channel: 'Website – Paid Ads',
    products: [
      'Phone Cases',
      'Screen Protectors',
      'Fast Chargers',
      'Power Banks',
      'LED Strip Lights',
      'Ring Lights',
      'Mini Projectors',
      'Posture Correctors',
      'Massage Guns',
      'MagSafe Power Bank',
      'Designer Phone Case',
      '4K Smart Projector',
      'Professional Ring Light',
    ],
  },
  {
    channel: 'Mobile App – Android',
    products: [
      'Smartphones',
      'Wireless Earbuds',
      'Bluetooth Speakers',
      'Fitness Trackers',
      'Gaming Controllers',
      'Phone Mounts',
      'Phone Stands',
      'Car Chargers',
      'Flagship Android Phone',
      'ANC Wireless Earbuds',
      'Smart Fitness Watch',
      'Premium Bluetooth Speaker',
    ],
  },
  {
    channel: 'Mobile App – iOS',
    products: [
      'Smartphones',
      'Smartwatches',
      'Wireless Earbuds',
      'Bluetooth Headphones',
      'Charging Cables',
      'Fast Chargers',
      'iPhone Pro Series',
      'Apple Watch Ultra',
      'AirPods Pro',
      'MagSafe Fast Charger',
    ],
  },
  {
    channel: 'Amazon Marketplace',
    products: [
      'Air Fryers',
      'Vacuum Cleaners',
      'Mixer Grinders',
      'Electric Kettles',
      'Storage Containers',
      'Water Bottles',
      'Bedsheets',
      'Pillows',
      'Smart Air Fryer',
      'Robot Vacuum Cleaner',
      'Premium Coffee Maker',
      'Luxury Bedsheets',
    ],
  },
  {
    channel: 'eBay Marketplace',
    products: [
      'External Hard Drives',
      'SSDs',
      'WiFi Routers',
      'Webcams',
      'USB Hubs',
      'Printers',
      'Printer Ink',
      'NVMe SSD',
      'WiFi 6 Router',
      '4K Webcam',
      'All-in-One Printer',
    ],
  },
  {
    channel: 'Etsy Marketplace',
    products: [
      'Handbags',
      'Wallets',
      'Belts',
      'Home Decor Items',
      'Wall Clocks',
      'Reusable Bags',
      'Eco Friendly Bottles',
      'Handcrafted Leather Handbag',
      'Designer Home Decor Item',
      'Luxury Wooden Wall Clock',
    ],
  },
  {
    channel: 'Allegro Marketplace',
    products: [
      'Office Chairs',
      'Study Tables',
      'Desk Organizers',
      'Whiteboards',
      'Calculators',
      'Notebooks',
      'Markers',
      'Ergonomic Executive Chair',
      'Solid Wood Study Table',
      'Premium Desk Organizer',
    ],
  },
  {
    channel: 'Flipkart Marketplace',
    products: [
      'Men T-Shirts',
      'Women Dresses',
      'Jeans',
      'Hoodies',
      'Shoes',
      'Sandals',
      'Watches',
      'Sunglasses',
      'Branded Sneakers',
      'Luxury Wrist Watch',
      'Designer Sunglasses',
      'Premium Winter Jacket',
    ],
  },
  {
    channel: 'Facebook Ads',
    products: [
      'Women Tops',
      'Makeup Kits',
      'Lipsticks',
      'Foundation',
      'Serums',
      'Moisturizers',
      'Sunscreen',
      'Luxury Skincare Kit',
      'Anti-Aging Serum',
      'Premium Makeup Palette',
    ],
  },
  {
    channel: 'Instagram Ads',
    products: [
      'Hair Dryer',
      'Hair Straightener',
      'Trimmers',
      'Yoga Mats',
      'Dumbbells',
      'Fitness Trackers',
      'Professional Hair Styler',
      'Smart Fitness Band',
      'Premium Yoga Mat',
    ],
  },
  {
    channel: 'Google Search Ads',
    products: [
      'Laptops',
      'Monitors',
      'Mechanical Keyboards',
      'Gaming Mouse',
      'Gaming Keyboard',
      'Gaming Laptop',
      '4K Curved Monitor',
      'Premium Gaming Keyboard',
    ],
  },
  {
    channel: 'Google Shopping Ads',
    products: [
      'Bluetooth Speakers',
      'Smart Home Devices',
      'LED Strip Lights',
      'Mini Projectors',
      'Smart Home Hub',
      'Dolby Atmos Speaker',
      '4K Home Projector',
    ],
  },
  {
    channel: 'YouTube Ads',
    products: [
      'Gaming Consoles',
      'Video Games',
      'Gaming Chairs',
      'VR Headsets',
      'Action Figures',
      'Next-Gen Gaming Console',
      'Premium Gaming Chair',
      'Advanced VR Headset',
    ],
  },
  {
    channel: 'TikTok Ads',
    products: [
      'Ring Lights',
      'Phone Stands',
      'Massage Guns',
      'Posture Correctors',
      'Desk Accessories',
      'Professional Massage Gun',
      'Luxury Desk Setup Kit',
    ],
  },
  {
    channel: 'Affiliate – Tech Bloggers',
    products: [
      'SSDs',
      'External Hard Drives',
      'WiFi Routers',
      'Mechanical Keyboards',
      'Webcams',
      'High-Speed NVMe SSD',
      'Enterprise WiFi Router',
    ],
  },
  {
    channel: 'Affiliate – Influencers',
    products: [
      'Smartwatches',
      'Wireless Earbuds',
      'Bluetooth Speakers',
      'Fitness Trackers',
      'Luxury Smartwatch',
      'Studio-Grade Speaker',
    ],
  },
  {
    channel: 'Affiliate – Coupon Sites',
    products: [
      'Phone Cases',
      'Charging Cables',
      'Fast Chargers',
      'Power Banks',
      'Premium Braided Charging Cable',
    ],
  },
  {
    channel: 'Affiliate – Cashback Platforms',
    products: [
      'Laptops',
      'Smartphones',
      'Tablets',
      'Flagship Smartphone',
      'High-End Tablet',
    ],
  },
  {
    channel: 'Wholesale Orders',
    products: [
      'Office Chairs',
      'Study Tables',
      'Printers',
      'Desk Organizers',
      'Whiteboards',
      'Bulk Ergonomic Chairs',
      'Enterprise Printers',
    ],
  },
  {
    channel: 'Corporate Sales',
    products: [
      'Laptops',
      'Monitors',
      'Keyboards',
      'Mouse',
      'Printers',
      'Office Chairs',
      'Business Laptop',
      'UltraWide Monitor',
    ],
  },
  {
    channel: 'Distributor Network',
    products: [
      'Smart Home Devices',
      'LED Strip Lights',
      'Mini Projectors',
      'Bluetooth Speakers',
      'Smart Security System',
      'Premium Home Theater Projector',
    ],
  },
  {
    channel: 'Email Marketing Campaign',
    products: [
      'Online Courses',
      'E-Books',
      'Notebooks',
      'Diaries',
      'Professional Certification Course',
    ],
  },
  {
    channel: 'Push Notifications',
    products: [
      'Water Bottles',
      'Lunch Boxes',
      'Storage Containers',
      'Eco Friendly Bottles',
      'Smart Insulated Bottle',
    ],
  },
  {
    channel: 'SMS Campaign',
    products: [
      'Phone Cases',
      'Screen Protectors',
      'Charging Cables',
      'Premium Glass Screen Protector',
    ],
  },
  {
    channel: 'Retail Store POS',
    products: [
      'Shoes',
      'Sandals',
      'Slippers',
      'Backpacks',
      'Wallets',
      'Belts',
      'Leather Backpack',
      'Luxury Leather Wallet',
    ],
  },
  {
    channel: 'Pop-up Store',
    products: [
      'Soft Toys',
      'Kids Learning Toys',
      'Drawing Books',
      'Art Supplies',
      'Educational STEM Toy Set',
    ],
  },
  {
    channel: 'Trade Fair / Expo',
    products: [
      'Smart Home Devices',
      'Gaming Consoles',
      'VR Headsets',
      'Musical Instruments',
      'Smart Home Automation Kit',
      'Professional Digital Piano',
    ],
  },
  {
    channel: 'Cross-border EU Sales',
    products: [
      'Smartphones',
      'Smartwatches',
      'Laptops',
      'Air Fryers',
      'Vacuum Cleaners',
      'Premium Smartphone',
      'Robot Vacuum Cleaner',
    ],
  },
  {
    channel: 'International Dropshipping',
    products: [
      'LED Strip Lights',
      'Phone Stands',
      'Ring Lights',
      'Mini Projectors',
      'Smart LED Lighting System',
    ],
  },
];

const products = [
  'Smartphones',
  'Phone Cases',
  'Screen Protectors',
  'Power Banks',
  'Wireless Earbuds',
  'Bluetooth Headphones',
  'Smartwatches',
  'Fitness Trackers',
  'Charging Cables',
  'Fast Chargers',
  'Bluetooth Speakers',
  'Laptops',
  'Tablets',
  'Monitors',
  'Mechanical Keyboards',
  'Wireless Mouse',
  'Gaming Mouse',
  'Gaming Keyboard',
  'Webcams',
  'USB Hubs',
  'External Hard Drives',
  'SSDs',
  'WiFi Routers',
  'Men T-Shirts',
  'Men Shirts',
  'Women Tops',
  'Women Dresses',
  'Jeans',
  'Trousers',
  'Hoodies',
  'Jackets',
  'Skirts',
  'Leggings',
  'Ethnic Wear',
  'Shoes',
  'Sandals',
  'Slippers',
  'Watches',
  'Sunglasses',
  'Belts',
  'Wallets',
  'Handbags',
  'Backpacks',
  'Cookware Sets',
  'Non-Stick Pans',
  'Pressure Cookers',
  'Air Fryers',
  'Mixer Grinders',
  'Electric Kettles',
  'Coffee Makers',
  'Storage Containers',
  'Lunch Boxes',
  'Water Bottles',
  'Bedsheets',
  'Pillows',
  'Curtains',
  'Wall Clocks',
  'Home Decor Items',
  'Indoor Plants',
  'Vacuum Cleaners',
  'Cleaning Mops',
  'Laundry Baskets',
  'Shoe Racks',
  'Face Wash',
  'Moisturizers',
  'Sunscreen',
  'Serums',
  'Lipsticks',
  'Foundation',
  'Makeup Kits',
  'Shampoo',
  'Conditioner',
  'Hair Oil',
  'Hair Dryer',
  'Hair Straightener',
  'Trimmers',
  'Electric Shavers',
  'Electric Toothbrush',
  'Weighing Machine',
  'BP Monitor',
  'Yoga Mats',
  'Dumbbells',
  'Gaming Consoles',
  'Video Games',
  'Gaming Controllers',
  'Gaming Chairs',
  'VR Headsets',
  'Board Games',
  'Puzzles',
  'Action Figures',
  'RC Cars',
  'Soft Toys',
  'Kids Learning Toys',
  'Drawing Books',
  'Art Supplies',
  'Musical Instruments',
  'Guitar Accessories',
  'Fiction Books',
  'Non-Fiction Books',
  'Academic Textbooks',
  'Competitive Exam Books',
  'Notebooks',
  'Diaries',
  'Pens',
  'Markers',
  'Office Chairs',
  'Study Tables',
  'Desk Organizers',
  'Printers',
  'Printer Ink',
  'Calculators',
  'Whiteboards',
  'Online Courses',
  'E-Books',
  'Car Seat Covers',
  'Car Chargers',
  'Dash Cameras',
  'Car Vacuum Cleaners',
  'Bike Helmets',
  'Bike Gloves',
  'Phone Mounts',
  'Travel Backpacks',
  'Suitcases',
  'Cabin Bags',
  'Travel Organizers',
  'Neck Pillows',
  'Camping Tents',
  'Sleeping Bags',
  'Flashlights',
  'Dog Food',
  'Cat Food',
  'Pet Treats',
  'Pet Feeding Bowls',
  'Pet Beds',
  'Dog Collars',
  'Leashes',
  'Cat Litter',
  'Pet Grooming Brushes',
  'Pet Shampoo',
  'Pet Toys',
  'Aquariums',
  'Smart Home Devices',
  'LED Strip Lights',
  'Phone Stands',
  'Ring Lights',
  'Mini Projectors',
  'Eco Friendly Bottles',
  'Reusable Bags',
  'Posture Correctors',
  'Massage Guns',
  'Desk Accessories',
];

const channels = ['Website', 'Mobile App', 'Marketplace Partner', 'Affiliate'];

function resetDatabase(db) {
  db.exec(`
    DELETE FROM tbltransaction;
    DELETE FROM tblaccount;
    DELETE FROM tbluser;
  `);
}

function createUser(db) {
  const hashedPassword = bcrypt.hashSync(CONFIG.USER.PASSWORD, 10);

  const stmt = db.prepare(`
    INSERT INTO tbluser
    (email, firstname, lastname, contact, password, provider, country, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    CONFIG.USER.EMAIL,
    CONFIG.USER.FIRSTNAME,
    CONFIG.USER.LASTNAME,
    CONFIG.USER.CONTACT,
    hashedPassword,
    CONFIG.USER.PROVIDER,
    CONFIG.USER.COUNTRY,
    CONFIG.USER.CURRENCY,
  );

  return result.lastInsertRowid;
}

function prepareStatements(db) {
  return {
    insertAccount: db.prepare(`
      INSERT INTO tblaccount
      (user_id, account_type, account_number, currency, account_balance)
      VALUES (?, ?, ?, ?, ?)
    `),
    insertTransaction: db.prepare(`
      INSERT INTO tbltransaction
      (user_id, account_id, description, reference, amount, type,
       balance_before, balance_after, status, category, createdat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateBalance: db.prepare(`
      UPDATE tblaccount SET account_balance = ? WHERE id = ?
    `),
  };
}

function generateAccountNumber() {
  return 'AC' + Math.floor(10000000 + Math.random() * 90000000);
}

function createAccount({
  userId,
  type,
  balance,
  insertAccount,
  insertTransaction,
}) {
  const acc = insertAccount.run(
    userId,
    type,
    generateAccountNumber(),
    CONFIG.TRANSACTION.CURRENCY,
    balance,
  );

  const accountId = acc.lastInsertRowid;

  insertTransaction.run(
    userId,
    accountId,
    CONFIG.CAPITAL.DESCRIPTION,
    CONFIG.CAPITAL.REFERENCE,
    balance,
    'credit',
    0,
    balance,
    CONFIG.CAPITAL.STATUS,
    CONFIG.CAPITAL.CATEGORY,
    CONFIG.CAPITAL.DATE,
  );

  return accountId;
}

function toCents(eur) {
  return Math.round(eur * 100);
}

function fromCents(cents) {
  return cents / 100;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function seasonalMultiplier(month) {
  if (month === 1) return CONFIG.SEASONAL_MULTIPLIER.JAN;
  if (month >= 6 && month <= 8) return CONFIG.SEASONAL_MULTIPLIER.SUMMER;
  if (month === 11) return CONFIG.SEASONAL_MULTIPLIER.NOV;
  if (month === 12) return CONFIG.SEASONAL_MULTIPLIER.DEC;
  return 1;
}

function crisisImpact(year, month) {
  return (
    year === CONFIG.CRISIS.YEAR &&
    month >= CONFIG.CRISIS.START_MONTH &&
    month <= CONFIG.CRISIS.END_MONTH
  );
}

function createTransactionAdder(state, insertTransaction, userId) {
  return function (accountId, amountCents, type, category, desc, date) {
    if (!amountCents || amountCents <= 0) return;

    const before = state[accountId];
    state[accountId] += type === 'credit' ? amountCents : -amountCents;
    const after = state[accountId];

    insertTransaction.run(
      userId,
      accountId,
      desc,
      `${category}-${Math.random()}`,
      fromCents(amountCents),
      type,
      fromCents(before),
      fromCents(after),
      CONFIG.TRANSACTION.STATUS,
      category,
      date,
    );
  };
}

function runMonthlySimulation({
  startYear,
  startMonth,
  months,
  baseRevenue,
  accounts,
  addTransaction,
}) {
  let year = startYear;
  let month = startMonth;

  for (let i = 0; i < months; i++) {
    const yearsPassed = year - startYear;

    let revenue =
      baseRevenue * Math.pow(1.2, yearsPassed) * seasonalMultiplier(month);

    if (crisisImpact(year, month)) {
      revenue *= CONFIG.CRISIS.IMPACT;
    }

    revenue *= randomBetween(
      CONFIG.RANDOMNESS.MONTHLY_MIN,
      CONFIG.RANDOMNESS.MONTHLY_MAX,
    );

    const monthlyCents = toCents(revenue);
    const days = new Date(year, month, 0).getDate();
    let accumulated = 0;

    for (let day = 1; day <= days; day++) {
      const daily =
        day === days
          ? monthlyCents - accumulated
          : Math.floor(
              (monthlyCents / days) *
                randomBetween(
                  CONFIG.RANDOMNESS.DAILY_MIN,
                  CONFIG.RANDOMNESS.DAILY_MAX,
                ),
            );

      accumulated += daily;

      const getDescription = (data = channelByProduct) => {
        const dataObj =
          data[Math.floor(Math.random() * channelByProduct.length)];

        const channel = dataObj.channel;

        const getRandomProducts = (products) => {
          if (!Array.isArray(products) || products.length === 0) return [];

          const max = Math.min(10, products.length);
          const count = Math.floor(Math.random() * max) + 1; // 1 → max

          const shuffled = [...products].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, count);
        };
        const getRandomQty = () => Math.floor(Math.random() * 3) + 1;
        const products = getRandomProducts(dataObj.products).reduce(
          (str, product) => {
            return `${str}, ${getRandomQty()} + ${product}`;
          },
          '',
        );

        return `${channel}: ${products.slice(1)}.`;
      };

      addTransaction(
        accounts.business,
        daily,
        'credit',
        'Revenue',
        // `${channel} - ${getRandomQty()}x ${getRandomProduct()}`,
        getDescription(),
        `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 10:00:00`,
      );
    }

    const refundRate =
      month === 1
        ? randomBetween(
            CONFIG.REFUND_RATES.JAN_MIN,
            CONFIG.REFUND_RATES.JAN_MAX,
          )
        : randomBetween(
            CONFIG.REFUND_RATES.OTHER_MIN,
            CONFIG.REFUND_RATES.OTHER_MAX,
          );

    const refundTotal = Math.floor(monthlyCents * refundRate);

    addTransaction(
      accounts.business,
      refundTotal,
      'debit',
      'Revenue Adjustment',
      'Customer Refund',
      `${year}-${String(month).padStart(2, '0')}-15 16:00:00`,
    );

    const fees = Math.floor(monthlyCents * CONFIG.COSTS.FEES_RATE);
    const marketing = Math.floor(monthlyCents * CONFIG.COSTS.MARKETING_RATE);
    const payroll = toCents(
      CONFIG.COSTS.BASE_PAYROLL + yearsPassed * CONFIG.COSTS.PAYROLL_INCREMENT,
    );
    const operations = toCents(
      CONFIG.COSTS.BASE_OPERATIONS +
        yearsPassed * CONFIG.COSTS.OPERATIONS_INCREMENT,
    );

    addTransaction(
      accounts.business,
      fees,
      'debit',
      'Fees',
      'Payment Gateway Fees',
      `${year}-${String(month).padStart(2, '0')}-25 18:00:00`,
    );
    addTransaction(
      accounts.business,
      marketing,
      'debit',
      'Marketing',
      'Online Advertising Campaign',
      `${year}-${String(month).padStart(2, '0')}-20 14:00:00`,
    );
    addTransaction(
      accounts.business,
      payroll,
      'debit',
      'Salary',
      'Monthly Employee Payroll',
      `${year}-${String(month).padStart(2, '0')}-28 09:00:00`,
    );
    addTransaction(
      accounts.business,
      operations,
      'debit',
      'Operations',
      'Office & SaaS Expenses',
      `${year}-${String(month).padStart(2, '0')}-10 11:00:00`,
    );

    const netProfit =
      monthlyCents - refundTotal - fees - marketing - payroll - operations;

    const toSavings = Math.floor(
      netProfit * CONFIG.COSTS.SAVINGS_TRANSFER_RATE,
    );
    const toCurrent = Math.floor(
      netProfit * CONFIG.COSTS.CURRENT_TRANSFER_RATE,
    );

    addTransaction(
      accounts.business,
      toSavings,
      'debit',
      'Transfer',
      'Profit Transfer to Savings',
      `${year}-${String(month).padStart(2, '0')}-30 12:00:00`,
    );
    addTransaction(
      accounts.savings,
      toSavings,
      'credit',
      'Transfer',
      'Profit from Business',
      `${year}-${String(month).padStart(2, '0')}-30 12:00:00`,
    );

    addTransaction(
      accounts.business,
      toCurrent,
      'debit',
      'Transfer',
      'Owner Draw',
      `${year}-${String(month).padStart(2, '0')}-30 15:00:00`,
    );
    addTransaction(
      accounts.current,
      toCurrent,
      'credit',
      'Transfer',
      'Income from Business',
      `${year}-${String(month).padStart(2, '0')}-30 15:00:00`,
    );

    console.log(
      `${year}-${String(month).padStart(2, '0')} | Net Profit: €${fromCents(netProfit).toLocaleString()}`,
    );

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
}

const seed = db.transaction(() => {
  resetDatabase(db);

  const userId = createUser(db);

  const { insertAccount, insertTransaction, updateBalance } =
    prepareStatements(db);

  const businessId = createAccount({
    userId,
    type: CONFIG.ACCOUNT_TYPES.BUSINESS,
    balance: CONFIG.INITIAL_BALANCES.BUSINESS,
    insertAccount,
    insertTransaction,
  });

  const savingsId = createAccount({
    userId,
    type: CONFIG.ACCOUNT_TYPES.SAVINGS,
    balance: CONFIG.INITIAL_BALANCES.SAVINGS,
    insertAccount,
    insertTransaction,
  });

  const currentId = createAccount({
    userId,
    type: CONFIG.ACCOUNT_TYPES.CURRENT,
    balance: CONFIG.INITIAL_BALANCES.CURRENT,
    insertAccount,
    insertTransaction,
  });

  const state = {
    [businessId]: CONFIG.INITIAL_BALANCES.BUSINESS * 100,
    [savingsId]: CONFIG.INITIAL_BALANCES.SAVINGS * 100,
    [currentId]: CONFIG.INITIAL_BALANCES.CURRENT * 100,
  };

  const addTransaction = createTransactionAdder(
    state,
    insertTransaction,
    userId,
  );

  runMonthlySimulation({
    startYear: CONFIG.SIMULATION.START_YEAR,
    startMonth: CONFIG.SIMULATION.START_MONTH,
    months: CONFIG.SIMULATION.MONTHS,
    baseRevenue: CONFIG.SIMULATION.BASE_REVENUE,
    accounts: {
      business: businessId,
      savings: savingsId,
      current: currentId,
    },
    addTransaction,
  });

  updateBalance.run(fromCents(state[businessId]), businessId);
  updateBalance.run(fromCents(state[savingsId]), savingsId);
  updateBalance.run(fromCents(state[currentId]), currentId);

  console.log('🏁 Final Business Balance:', fromCents(state[businessId]));
  console.log('🏁 Final Savings Balance:', fromCents(state[savingsId]));
  console.log('🏁 Final Current Balance:', fromCents(state[currentId]));
});

seed();

console.log('✅ Seed completed successfully.');
