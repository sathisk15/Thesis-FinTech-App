import './config/init_db.js';
// import './config/seed.js';
import app from './app.js';

app.listen(4000, () => {
  console.log('🚀 Backend running on port 4000');
});
