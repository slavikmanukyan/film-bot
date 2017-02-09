import { init as initDb } from './lib/db';

initDb()
.then(() => console.log('init'));