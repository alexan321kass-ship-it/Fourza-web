const fs = require('fs');
let content = fs.readFileSync('catalogo/index.html', 'utf8');
content = content.replace(/<!-- ================= PRODUCT DETAILS MODAL ================= -->[\s\S]*?<\/div>\s*<\/div>\s*/, '');
fs.writeFileSync('catalogo/index.html', content);
console.log('Removed duplicate modal');
