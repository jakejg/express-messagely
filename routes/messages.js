const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const Message = require("../models/message");
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config");
const { ensureLoggedIn } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', ensureLoggedIn, async(req, res, next) => {
    try{
        const msg = await Message.get(req.params.id)

        if (req.user.username !== msg.from_user.username && req.user.username !== msg.to_user.username) {
            throw new ExpressError("Must be the sender or recipient to vew message", 400)
        }
        return res.json({msg});
    }
    catch(e){
        next(e);
    }
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async(req, res, next) => {
    
    try{
        const { to_username, body } = req.body;
        const message = await Message.create({from_username: req.user.username, to_username, body})
        return res.json({message});
    }
    catch(e){
        next(e);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async(req, res, next) => {
    try{
        const msg = await Message.get(req.params.id)

        if (req.user.username !== msg.to_user.username) {
            throw new ExpressError("Must be the sender or recipient to vew message", 400)
        }
        const readMsg = await Message.markRead(req.params.id)

        return res.json({readMsg});
    }
    catch(e){
        next(e);
    }
});

module.exports = router;

