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
        const uniqueName = path.basename(filepath).split(".")[0];
        const wayName = path.join(__dirname, "../python_runner");
        exec(`cd ${wayName} && python ${uniqueName}.py`, (error, stdout, stderr) => {
            if (error) reject(error);
            else if (stderr) reject(stderr);
            else resolve(stdout);
        });
    });
};

module.exports = {
    generatefile,
    executepy
};