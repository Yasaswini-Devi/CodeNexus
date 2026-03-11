const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

// Ensure the directory for temp files exists
const dirCodes = path.join(__dirname, 'temp_codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

// Function to write the code into a .py file
const generatefile = async (format, content) => {
    const jobId = uuid();
    const filename = `${jobId}.${format}`;
    const filepath = path.join(dirCodes, filename);
    await fs.promises.writeFile(filepath, content);
    return filepath;
};

// Function to execute the .py file
const executepy = (filepath) => {
    return new Promise((resolve, reject) => {
        // ✅ Run python3 directly on the absolute path of the generated file
        exec(`python3 "${filepath}"`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
};

module.exports = {
    generatefile,
    executepy
};