import fs from 'fs';

let content = fs.readFileSync('./src/pages/admin/AdminDashboard.tsx', 'utf8');
content = content.replace(/bg-blue-100/g, 'bg-blue-50');
content = content.replace(/dark:bg-blue-900\/50/g, 'dark:bg-slate-800');
content = content.replace(/bg-amber-100 p-3/g, 'bg-blue-50 p-3');
content = content.replace(/text-amber-600 dark:text-amber-400/g, 'text-blue-600 dark:text-blue-400');
fs.writeFileSync('./src/pages/admin/AdminDashboard.tsx', content, 'utf8');
