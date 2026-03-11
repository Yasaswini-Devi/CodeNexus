const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

// Ensure the directory for temp files exists
const dirCodes = path.join(__dirname, 'temp_codes');
if (!fs.existsSync(dirCodes)) {
    fs.mkdirSync(dirCodes, { recursive: true });
}

const sanitizeFileName = (name) => {
    const baseName = path.basename(name || 'uploaded_file');
    return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const buildWrappedPythonCode = (userCode = '') => {
    const prelude = `
import os
_cn_matplotlib_enabled = False

try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as _cn_plt
    _cn_matplotlib_enabled = True

    def _cn_capture_show(*args, **kwargs):
        fig_nums = _cn_plt.get_fignums()
        for idx, fig_num in enumerate(fig_nums, 1):
            fig = _cn_plt.figure(fig_num)
            file_name = f"cn_plot_{fig_num}_{idx}.png"
            fig.savefig(file_name, bbox_inches='tight')
        _cn_plt.close('all')

    _cn_plt.show = _cn_capture_show
except Exception:
    _cn_matplotlib_enabled = False
`;

    const finale = `
if '_cn_matplotlib_enabled' in globals() and _cn_matplotlib_enabled:
    try:
        _remaining = _cn_plt.get_fignums()
        for _idx, _fig_num in enumerate(_remaining, 1):
            _fig = _cn_plt.figure(_fig_num)
            _fig.savefig(f"cn_plot_final_{_fig_num}_{_idx}.png", bbox_inches='tight')
        _cn_plt.close('all')
    except Exception:
        pass
`;

    return `${prelude}\n${userCode}\n${finale}`;
};

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
        // Use the full absolute path so Python can always find the file
        // Wrap in quotes to handle spaces in Windows paths (e.g. OneDrive)
        exec(`python3 "${filepath}"`, { timeout: 10000 }, (error, stdout, stderr) => {
            // Clean up temp file after execution
            fs.unlink(filepath, () => { });

            if (error) reject(error.message || error.toString());
            else if (stderr) reject(stderr);
            else resolve(stdout);
        });
    });
};

const executePythonJob = async ({ code, files = [] }) => {
    const jobId = uuid();
    const jobDir = path.join(dirCodes, jobId);
    const filePath = path.join(jobDir, `${jobId}.py`);

    await fs.promises.mkdir(jobDir, { recursive: true });
    await fs.promises.writeFile(filePath, buildWrappedPythonCode(code || ''), 'utf8');

    for (const file of files) {
        const safeName = sanitizeFileName(file.originalname);
        const uploadPath = path.join(jobDir, safeName);
        await fs.promises.writeFile(uploadPath, file.buffer);
    }

    const output = await new Promise((resolve, reject) => {
        exec(
            `python3 "${filePath}"`,
            { timeout: 15000, cwd: jobDir, maxBuffer: 5 * 1024 * 1024 },
            (error, stdout, stderr) => {
                if (error) {
                    reject(stderr || error.message || error.toString());
                    return;
                }
                if (stderr) {
                    resolve(`${stdout || ''}\n${stderr}`.trim());
                    return;
                }
                resolve(stdout || 'Execution completed successfully.');
            }
        );
    });

    const visualizationExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg']);
    const mimeByExt = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const dirEntries = await fs.promises.readdir(jobDir, { withFileTypes: true });
    const visualizations = [];

    for (const entry of dirEntries) {
        if (!entry.isFile()) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (!visualizationExts.has(ext)) continue;

        const fullPath = path.join(jobDir, entry.name);
        const fileBuffer = await fs.promises.readFile(fullPath);
        const mime = mimeByExt[ext] || 'application/octet-stream';

        visualizations.push({
            name: entry.name,
            mime,
            dataUrl: `data:${mime};base64,${fileBuffer.toString('base64')}`,
        });
    }

    await fs.promises.rm(jobDir, { recursive: true, force: true });

    return { output, visualizations };
};

module.exports = {
    generatefile,
    executepy,
    executePythonJob,
};
