const fs = require('fs');
const path = require('path');

// Mappa, amit be akarunk járni
const rootDir = path.join(__dirname, 'src/app');

// Kimeneti fájl, amit ide másolsz a chatbe
const outputFile = path.join(__dirname, 'allFilesForChat.txt');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.ts') || file.endsWith('.html') || file.endsWith('.scss')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk(rootDir);
let output = '';

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  output += `--- FILE START: ${file} ---\n`;
  output += content + '\n';
  output += `--- FILE END: ${file} ---\n\n`;
});

fs.writeFileSync(outputFile, output);
console.log(`Export kész: ${outputFile}`);
