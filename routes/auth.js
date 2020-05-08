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
        if ( password === undefined){
            throw new ExpressError("Must send a username and password with valid JSON", 400)
        }
        const auth = await User.authenticate(username, password)
        if (auth) {
            const user = await User.get(username)
            user.updateLoginTimestamp()
            await user.save()

            const payload = {
                username: user.username,
                name: user.firstName
            }
            const _token = jwt.sign(payload, SECRET_KEY)  
            return res.json({_token})
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
 * {username, password, firstName, lastName, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post('/register', async (req, res, next) => {
    try{
        const user = await User.register(req.body)
      
        await user.save()
        
        const payload = {
            username: user.username,
            name: user.firstName
        }
        const _token = jwt.sign(payload, SECRET_KEY)  
        return res.json({_token})
    }
    catch(e){
        next(e)
    }

 })

 module.exports = router

