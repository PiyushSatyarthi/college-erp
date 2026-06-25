import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
  if (dir.includes('node_modules') || dir.includes('.git') || dir.includes('dist')) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stats = fs.statSync(filepath);
    if (stats.isDirectory()) {
      walk(filepath, callback);
    } else if (stats.isFile() && (filepath.endsWith('.tsx') || filepath.endsWith('.ts'))) {
      callback(filepath);
    }
  }
}

walk('./src', (filepath) => {
  let content = fs.readFileSync(filepath, 'utf8');
  let original = content;

  // Replace bg-gradient-to-X with bg-blue-600
  content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-blue-600');
  // Some gradients have middle colors
  content = content.replace(/bg-gradient-to-[a-z]+ from-[a-z]+-\d+ via-[a-z]+-\d+ to-[a-z]+-\d+/g, 'bg-blue-600');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
