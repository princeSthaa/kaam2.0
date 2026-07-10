const fs = require('fs');

const file1 = 'C:\\Code\\Kaam2\\frontend\\my-app\\app\\Production\\Plan\\CreateDetails\\components\\Dashboard.tsx';
let code1 = fs.readFileSync(file1, 'utf8');

// fix image
code1 = code1.replace(/https:\/\/lh3.googleusercontent.com\/[a-zA-Z0-9_-]+/g, '/images/products/casual-shirt.jpg');

// fix options
code1 = code1.replace(/<option defaultValue="value">/g, '<option>');

fs.writeFileSync(file1, code1);
console.log('Done!');
