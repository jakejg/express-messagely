const express = require('express');
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken")
const ExpressError = require("../expressError")
const { SECRET_KEY } = require("../config")



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async (req, res, next) => {
    try{
        const { username, password } = req.body
        const auth = await User.authenticate(username, password)
        if (auth) {
            const user = await User.get(username)
            user.updateLoginTimestamp()
            await user.save()

            const payload = {
                username: user.username,
                name: user.firstName
            }
            const token = jwt.sign(payload, SECRET_KEY)  
            return res.json({token})
        }
        else{
            throw new ExpressError("Password/username do not match", 400)
        }  
    }
    catch(e){
        next(e)
    }                       
    
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

