const User = require("../models/User");
let mongoose = require('mongoose');
const router = require("express").Router();

// list users
router.get("/list", async (req, res) => {
  let filter = {
    _id: { $ne: mongoose.Types.ObjectId(req.query.userId) }
  }
  if (req.query.username) {
    filter['username'] = { $regex: req.query.username, $options: 'i' }
  }
  try {
    let users = await User.find(filter, { username: 1, isAdmin: 1 }).sort({ "username": 1 })
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
