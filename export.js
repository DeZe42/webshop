const fs = require('fs');
const path = require('path');

const OUTPUT = 'project-export.txt';

// Mappák amiket kihagyunk
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'coverage',
  '.angular',
  '.git',
  '.vscode',
  '.idea',
  '.nx', // ⭐ Ha Nx van
  'tmp',
  '.cache',
];

// Pontos fájlnevek amiket kihagyunk
const EXCLUDE_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.DS_Store',
  'Thumbs.db',
  '.gitignore',
  '.editorconfig',
  '.prettierrc',
  '.eslintrc.json', // Opcionális, ha nem kell
];

// Fájl kiterjesztések amiket kihagyunk
const EXCLUDE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.svg',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.map',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
];

// Fájlnév pattern-ek (regex)
const EXCLUDE_PATTERNS = [
  /\.min\.(js|css)$/, // Minified fájlok
  /\.bundle\.(js|css)$/,
  /-lock\.json$/, // Bármilyen lock fájl
];

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

let output = 'PROJECT STRUCTURE AND CODE EXPORT\n';
output += '='.repeat(50) + '\n\n';
output += 'DIRECTORY STRUCTURE:\n\n';

const allFiles = [];

function shouldExcludeFile(file, relativePath) {
  // Fájlnév alapján
  if (EXCLUDE_FILES.includes(file)) return true;

  // Kiterjesztés alapján
  const ext = path.extname(file);
  if (EXCLUDE_EXTENSIONS.includes(ext)) return true;

  // Pattern alapján
  if (EXCLUDE_PATTERNS.some((pattern) => pattern.test(file))) return true;

  return false;
}

function walkDir(dir, indent = '') {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(process.cwd(), filePath);

    // Mappa kizárás
    if (EXCLUDE_DIRS.some((ex) => relativePath.includes(ex))) return;

    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      output += `${indent}📁 ${file}/\n`;
      walkDir(filePath, indent + '  ');
    } else {
      // Fájl kizárások
      if (shouldExcludeFile(file, relativePath)) return;

      // Méret ellenőrzés
      if (stat.size >= MAX_FILE_SIZE) {
        console.warn(
          `⚠️  Skipping large file: ${relativePath} (${(stat.size / 1024).toFixed(2)} KB)`,
        );
        return;
      }

      output += `${indent}📄 ${file}\n`;
      allFiles.push(relativePath);
    }
  });
}

walkDir(process.cwd());

output += '\n' + '='.repeat(50) + '\n\n';
output += 'FILE CONTENTS:\n';

allFiles.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    output += '\n' + '='.repeat(50) + '\n';
    output += `FILE: ${file}\n`;
    output += '='.repeat(50) + '\n\n';
    output += content + '\n';
  } catch (err) {
    console.error(`❌ Error reading ${file}:`, err.message);
  }
});

fs.writeFileSync(OUTPUT, output);
console.log(`✅ Export complete: ${OUTPUT}`);
console.log(`📊 Total files: ${allFiles.length}`);
console.log(`💾 Output size: ${(fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2)} MB`);
