const express = require('express');
const router = new express.Router();
const User = require("../models/user");



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body
    const u = await User.authenticate(username, password)
    console.log(u)
    debugger
})

router.post('/update/:user', async (req, res, next) => {

    const u = await User.get(req.params.user)
    u.updateLoginTimestamp()
    u.save()
    console.log(u)
    debugger
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post('/register', async (req, res, next) => {
     const u = await User.register(req.body)
     console.log(u)
     await u.save()
     debugger
 })

 module.exports = router

 
