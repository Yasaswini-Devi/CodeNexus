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
        // Use the full absolute path so Python can always find the file
        // Wrap in quotes to handle spaces in Windows paths (e.g. OneDrive)
        exec(`python "${filepath}"`, { timeout: 10000 }, (error, stdout, stderr) => {
            // Clean up temp file after execution
            fs.unlink(filepath, () => { });

            if (error) reject(error.message || error.toString());
            else if (stderr) reject(stderr);
            else resolve(stdout);
        });
    });
};

module.exports = {
    generatefile,
    executepy
};
