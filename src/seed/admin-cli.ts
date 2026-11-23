import { adminScript } from './admin';

// `payload run` exits 1 when this top-level await rejects
// (`payload/dist/bin/index.js` catches the import failure), but the script
// also sets `process.exitCode` for the paths the runner swallows.
await adminScript();
