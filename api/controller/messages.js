const router = require("express").Router();
const Message = require("../models/Message");
const conversation = require('../models/Conversation');

//add

router.post("/", async (req, res) => {

  let msgCount = await Message.countDocuments({ conversationId: req.body.conversationId })

  if (msgCount === 0) {
    await conversation.findOneAndUpdate({ _id: req.body.conversationId }, { starter: req.body.sender })
  }

  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
