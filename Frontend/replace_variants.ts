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

  content = content.replace(/variant="admin"/g, 'variant="info"');
  content = content.replace(/variant="hod"/g, 'variant="info"');
  content = content.replace(/variant="faculty"/g, 'variant="info"');
  content = content.replace(/variant="student"/g, 'variant="info"');
  content = content.replace(/variant="parent"/g, 'variant="info"');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
