// scripts/fix-port.js
const { exec } = require('child_process');
const os = require('os');

console.log('🔧 Fixing port issues...');

if (os.platform() === 'win32') {
    // Windows
    exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
        if (stdout) {
            const lines = stdout.split('\n');
            lines.forEach(line => {
                const match = line.match(/:3000.*LISTENING\s+(\d+)/);
                if (match) {
                    const pid = match[1];
                    console.log(`🛑 Killing process ${pid} using port 3000`);
                    exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
                        if (error) {
                            console.log('❌ Error killing process:', error.message);
                        } else {
                            console.log('✅ Process killed successfully');
                        }
                    });
                }
            });
        } else {
            console.log('✅ Port 3000 is free');
        }
    });
} else {
    // macOS/Linux
    exec('lsof -ti:3000', (error, stdout, stderr) => {
        if (stdout) {
            const pids = stdout.trim().split('\n');
            pids.forEach(pid => {
                if (pid) {
                    console.log(`🛑 Killing process ${pid} using port 3000`);
                    exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
                        if (error) {
                            console.log('❌ Error killing process:', error.message);
                        } else {
                            console.log('✅ Process killed successfully');
                        }
                    });
                }
            });
        } else {
            console.log('✅ Port 3000 is free');
        }
    });
}