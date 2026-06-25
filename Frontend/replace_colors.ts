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

  // Replace colors
  content = content.replace(/violet/g, 'blue');
  content = content.replace(/pink/g, 'blue');
  content = content.replace(/teal/g, 'blue');
  content = content.replace(/orange/g, 'blue');

  // For amber, we need to be careful as amber is used for warning status.
  // Generally user says: 
  // Student role color was amber.
  // Warning is also amber.
  // We can just leave amber alone for now or only replace amber when it's clearly not a status, or replace all amber and then restore warning colors manually.
  // Since amber was the student role color, a lot of amber might be in student components (like StudentMarks.tsx, StudentDashboard.tsx).
  // I will replace amber with blue ONLY in /src/pages/student and /src/components/layout/Sidebar.tsx.
  
  if (filepath.includes('/pages/student') || filepath.includes('Sidebar.tsx')) {
    content = content.replace(/amber/g, 'blue');
  }

  // Remove roleColor="admin" etc from buttons.
  content = content.replace(/roleColor="[^"]+"/g, '');

  if (content !== original) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${filepath}`);
  }
});
