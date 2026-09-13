import { wirePlatform } from '@lpc/platform';
import { createServer } from './server';

const PORT = Number(process.env.PORT ?? 3000);

const platform = wirePlatform();
const app = createServer(platform);

app.listen(PORT, () => {
  console.log(`Local Pay & Credit API listening on http://localhost:${PORT}`);
});
