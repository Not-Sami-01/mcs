import { script } from './index';

// `payload run` exits 1 when this top-level await rejects
// (`payload/dist/bin/index.js` catches the import failure).
await script();
