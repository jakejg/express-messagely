const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const ExpressError = require("../expressError")
const { SECRET_KEY } = require("../config")
const { ensureCorrectUser } = require("../middleware/auth")


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', async(req, res, next) => {
    try{
        const users = await User.all();
        return res.json({users});
    }
    catch(e){
        next(e);
    }

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

})

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    try{
        const user = await User.get(req.params.username);
        delete user.password;
        return res.json({user});
    }
    catch(e){
        next(e);
    };
})


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to', async(req, res, next) => {
    try{
        const user = await User.get(req.params.username);
        const messages = await user.messagesTo();
        return res.json({messages});
    }
    catch(e){
        next(e);
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async(req, res, next) => {
    try{
        const user = await User.get(req.params.username);
        const messages = await user.messagesTo();
        return res.json({messages});
    }
    catch(e){
        next(e);
    }
})

 module.exports = router;
