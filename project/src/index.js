import fs from 'fs';
const files = fs.readdirSync('./satellites')
  .filter(file => file.endsWith('.js') && file !== 'index.js');

const exports = files.map(f => `export * from './${f}';`).join('\n');
fs.writeFileSync('./satellites/index.js', exports);