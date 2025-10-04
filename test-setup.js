// test-setup.js - Run this to check your setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking project setup...\n');

// Check if package.json exists
if (fs.existsSync('package.json')) {
    console.log('✅ package.json found');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`📦 Project: ${pkg.name} v${pkg.version}`);
} else {
    console.log('❌ package.json not found!');
}

// Check if node_modules exists
if (fs.existsSync('node_modules')) {
    console.log('✅ node_modules folder exists');
} else {
    console.log('❌ node_modules not found - run: npm install');
}

// Check server structure
const serverFiles = ['server.js', 'config/database.js'];
serverFiles.forEach(file => {
    const fullPath = path.join('server', file);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${fullPath} exists`);
    } else {
        console.log(`❌ ${fullPath} missing`);
    }
});

console.log('\n💡 Recommended fixes:');
console.log('1. Delete node_modules folder and package-lock.json');
console.log('2. Run: npm install');
console.log('3. Run: npm start\n');