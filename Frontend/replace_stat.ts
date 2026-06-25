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

  // Fix stat cards rounded-full bg
  content = content.replace(/bg-blue-100/g, 'bg-blue-50');
  content = content.replace(/bg-amber-100 p-3 dark:bg-amber-900\/50/g, 'bg-blue-50 p-3 dark:bg-slate-800');
  content = content.replace(/text-amber-600 dark:text-amber-400/g, 'text-blue-600 dark:text-blue-400');
  content = content.replace(/dark:bg-blue-900\/50/g, 'dark:bg-slate-800');

  // Fix some remaining amber issues
  content = content.replace(/border-amber-200/g, 'border-slate-200');
  content = content.replace(/border-l-amber-500/g, 'border-l-blue-600');
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
