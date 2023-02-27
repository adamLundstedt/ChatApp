const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//create admin
router.post("/create", async (req, res) => {
    try {
        let findAdmin = await User.findOne({ isAdmin: true })
        if (findAdmin) {
            return res.status(500).json({ message: 'Admin Already Exist' })
        }
        else {
            //generate new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //create new user
            const newUser = new User({
                username: 'admin',
                email: req.body.email,
                password: hashedPassword,
                isAdmin: true
            });

            //save user and respond
            const user = await newUser.save();
            res.status(200).json(user);
        }
    } catch (err) {
        res.status(500).json(err)
    }
});


module.exports = router;
