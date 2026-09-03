const fs = require('fs'); 
let c = fs.readFileSync('backend/mailer.js', 'utf8'); 
c = c.replace(/from: '[^']+',/g, 'from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,'); 
c = c.replace(/from: "[^"]+",/g, 'from: `"FOURZA S.A.S" <${process.env.SMTP_USER}>`,'); 
fs.writeFileSync('backend/mailer.js', c); 
console.log('Fixed');
