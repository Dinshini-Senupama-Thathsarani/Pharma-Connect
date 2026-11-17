import app from './app';
import { connectDB } from './config/db';
import { assertEnv, env } from './config/env';

(async () => {
  assertEnv();
  await connectDB();
  app.listen(env.port, () => console.log(`API listening on port ${env.port}`));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
