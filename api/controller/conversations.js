const router = require("express").Router();
let mongoose = require('mongoose');
const Conversation = require("../models/Conversation");
const Messages = require("../models/Message");

//new conv

router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// List Conv

router.get("/list/:adminId", async (req, res) => {
  try {

    let conversation = await Conversation.aggregate([

      {
        $project: {
          "firstMember": { "$arrayElemAt": ["$members", 0] },
          "secondMember": { "$arrayElemAt": ["$members", 1] }
        }
      },
      {
        $project: {
          "firstMember": {
            $convert:
            {
              input: "$firstMember",
              to: "objectId",
            }
          },

          "secondMember": {
            $convert:
            {
              input: "$secondMember",
              to: "objectId",
            }
          }

        }
      },

      // Match
      {
        $match: {
          'firstMember': { $ne: mongoose.Types.ObjectId(req.params.adminId) },
          'secondMember': { $ne: mongoose.Types.ObjectId(req.params.adminId) },
        }
      },


      {
        $lookup: {
          from: "users",
          localField: "firstMember",
          foreignField: "_id",
          as: "firstUser"
        }
      },
      { $unwind: { path: "$firstUser", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "secondMember",
          foreignField: "_id",
          as: "secondUser"
        }
      },
      { $unwind: { path: "$secondUser", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          firstUser: '$firstUser.username',
          secondUser: '$secondUser.username',
          firstUserId: '$firstMember',
          secondUserId: '$secondMember'
        }
      }
    ])
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});



//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/get/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    if (conversation) {
      return res.status(200).json(conversation)
    }
    else {
      const newConversation = new Conversation({
        members: [req.params.firstUserId, req.params.secondUserId],
      });
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    await Messages.deleteMany({ conversationId: mongoose.Types.ObjectId(req.params.id) })
    let delConv = await Conversation.findOneAndDelete({ _id: mongoose.Types.ObjectId(req.params.id) })
    if (delConv) {
      return res.status(200).json({ success: true, message: 'Conversation deleted successfully.' });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
