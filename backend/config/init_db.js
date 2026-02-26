import db from '../db/db.js';

console.log('🔄 Initializing database...');

// Always enable FK support in SQLite
db.exec(`PRAGMA foreign_keys = ON;`);

const init = db.transaction(() => {
  // ======================
  // USERS TABLE
  // ======================
  db.exec(`
    CREATE TABLE IF NOT EXISTS tbluser (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      firstname TEXT NOT NULL,
      lastname TEXT,
      contact TEXT,
      password TEXT,
      provider TEXT DEFAULT 'local',
      country TEXT,
      currency TEXT NOT NULL DEFAULT 'EUR',
      createdat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ======================
  // ACCOUNTS TABLE
  // ======================
  db.exec(`
    CREATE TABLE IF NOT EXISTS tblaccount (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL
    CHECK (account_type IN ('Savings','Current','Business')),
    account_number TEXT NOT NULL UNIQUE,
    currency TEXT NOT NULL DEFAULT 'EUR',
    account_balance REAL NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    createdat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tbluser(id) ON DELETE CASCADE,
    UNIQUE(user_id, account_type)
  );
  `);

  // ======================
  // TRANSACTIONS TABLE
  // ======================
  db.exec(`
      CREATE TABLE IF NOT EXISTS tbltransaction (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,

      description TEXT NOT NULL,
      reference TEXT,

      amount REAL NOT NULL CHECK (amount > 0),
      type TEXT NOT NULL CHECK (type IN ('credit','debit')),

      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,

      status TEXT NOT NULL DEFAULT 'Completed'
      CHECK (status IN ('Pending','Completed','Failed')),

      category TEXT,

      createdat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES tbluser(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES tblaccount(id) ON DELETE CASCADE
    );
 `);

  // ======================
  // INDEXES
  // ======================
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_account_user
      ON tblaccount(user_id);

    CREATE INDEX IF NOT EXISTS idx_transaction_user
      ON tbltransaction(user_id);

    CREATE INDEX IF NOT EXISTS idx_transaction_account
      ON tbltransaction(account_id);

    CREATE INDEX IF NOT EXISTS idx_transaction_created
      ON tbltransaction(createdat);
  `);
});

init();

console.log('✅ Database initialized successfully.');
