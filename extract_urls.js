const fs = require('fs'); 
const data = fs.readFileSync('scratch_bundle.js', 'utf8'); 
const match = data.match(/https?:\/\/[^\s"\'\`]+/g); 
console.log(match ? match.filter(m => m.includes('aerotalk')) : 'No matches found');
