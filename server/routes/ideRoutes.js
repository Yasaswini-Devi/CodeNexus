const express = require('express');
const router = express.Router();
const UserIDE = require('../models/UserIDE');
const auth = require('../middleware/auth'); // Check this path!

// DEBUGGING: Log whenever this route is hit
router.put('/save', auth, async (req, res) => {
  console.log("📥 SAVE ATTEMPT RECEIVED");
  console.log("User:", req.user.id);
  console.log("Files count:", req.body.files ? req.body.files.length : 0);

  try {
    const { files } = req.body;

    // 1. Validate Input
    if (!files || !Array.isArray(files)) {
      console.error("❌ Invalid files data");
      return res.status(400).json({ msg: "Invalid files data" });
    }

    // 2. Find and Update
    let ideState = await UserIDE.findOne({ userId: req.user.id });

    if (ideState) {
      // Update existing
      ideState.files = files;
      await ideState.save();
      console.log("✅ Updated User IDE");
    } else {
      // Create new
      ideState = new UserIDE({
        userId: req.user.id,
        files: files
      });
      await ideState.save();
      console.log("✅ Created New User IDE");
    }

    res.json({ success: true, files: ideState.files });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
    try {
        const ideState = await UserIDE.findOne({ userId: req.user.id });
        res.json({ files: ideState ? ideState.files : [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;