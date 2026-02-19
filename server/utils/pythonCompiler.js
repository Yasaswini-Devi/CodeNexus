const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const dirCodes = path.join(__dirname, "../python_runner");
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const generatefile = async (format, content) => {
    const jobId = uuid(); 
    const filename = `${jobId}.${format}`;
    const filepath = path.join(dirCodes, filename);
    fs.writeFileSync(filepath, content);
    return filepath;
};

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

module.exports = { executepy, generatefile };