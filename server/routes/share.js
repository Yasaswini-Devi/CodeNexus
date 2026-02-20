const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// temporary storage (later DB)
const sharedCodes = {};

// SAVE CODE
router.post("/", (req, res) => {
  const { code, language } = req.body;

  const id = uuidv4();

  sharedCodes[id] = {
    code,
    language,
  };

  res.json({ id });
});

// FETCH SHARED CODE
router.get("/:id", (req, res) => {
  const data = sharedCodes[req.params.id];

  if (!data) {
    return res.status(404).json({ error: "Code not found" });
  }

  res.json(data);
});

module.exports = router;
