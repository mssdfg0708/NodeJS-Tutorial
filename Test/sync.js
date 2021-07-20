const fs = require("fs");

console.log('=== Sync ===');
console.log('A');
const data = fs.readFileSync('syncTest', 'utf8');
console.log(data);
console.log('B');

console.log('\n=== ASync ===');
console.log('A');
fs.readFile('syncTest', 'utf8', (err, data) => {
    console.log(data);
});
console.log('B');
