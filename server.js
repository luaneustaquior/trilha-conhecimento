import { createDatabase } from './src/db/database.js';
import { createApp } from './src/app.js';

const PORT = Number(process.env.PORT) || 3000;
const db = createDatabase(undefined, { seedDemoTrilhas: true });
const app = createApp(db);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trilha do Conhecimento running at http://0.0.0.0:${PORT}`);
});
