// Writes build/version.json so open tabs can tell when a newer deploy is live.
const fs = require('fs');
const id = process.env.VERCEL_GIT_COMMIT_SHA || 'dev';
fs.writeFileSync('build/version.json', JSON.stringify({ id }));
console.log('version.json written:', id);
