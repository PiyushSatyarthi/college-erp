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

  // Bar chart fills
  content = content.replace(/fill="#DB2777"/g, 'fill="#2563EB"');
  content = content.replace(/fill="#0d9488"/g, 'fill="#2563EB"');
  content = content.replace(/fill="#3b82f6"/g, 'fill="#2563EB"');
  content = content.replace(/fill="#8b5cf6"/g, 'fill="#60A5FA"');

  // Line chart strokes
  content = content.replace(/stroke="#0d9488"/g, 'stroke="#2563EB"');
  content = content.replace(/stroke="#f59e0b"/g, 'stroke="#2563EB"');

  // Pie chart COLORS array
  content = content.replace(/#0d9488/g, '#2563EB'); // FacultyDashboard.tsx
  
  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
