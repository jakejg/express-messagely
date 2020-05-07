const db = require('../db');
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError")
const { BCRYPT_WORK_FACTOR } = require('../config')
/** User class for message.ly */



/** User of the site. */

class User {
    constructor({username, password, firstName, lastName, phone, joinAt, lastLoginAt}) {
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.joinAt = joinAt;
        this.lastLoginAt = lastLoginAt;
    }

    /** register new user -- returns
     *    {username, password, first_name, last_name, phone}
     */

    static async register({username, password, firstName, lastName, phone}) {
        
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        
        return new User({username, password: hashedPassword, firstName, lastName, phone});
        
    }

    //**get user by username from database */

    static async get(username) {
        const results = await db.query(
          `SELECT username, password,
            first_name AS "firstName", 
            last_name AS "lastName", 
            phone, 
            join_at AS "joinAt",
            last_login_at AS "lastLoginAt"
            FROM users WHERE username = $1`,
          [username]
        );      
        const user = results.rows[0];     
        if (user === undefined) {
          const err = new ExpressError(`No such user: ${username}`);
          err.status = 404;
          throw err;
        }        
        return new User(user);
    }

    /** Authenticate: is this username/password valid? Returns boolean. */

    static async authenticate(username, password) {
        const user = await this.get(username);
        
        const auth = await bcrypt.compare(password, user.password);
        return auth;
     }

    /** Update last_login_at for user */

    async updateLoginTimestamp() {
        this.lastLoginAt = new Date()
     }

    /** All: basic info on all users:
     * [{username, first_name, last_name, phone}, ...] */

    static async all() { 
        const results = await db.query(
            `SELECT username,
              first_name AS "firstName", 
              last_name AS "lastName", 
              phone
              FROM users
              `);
        return results.rows.map(row => {
            return new User(row)
        })
    }
    /** Return messages from this user.
     *
     * [{id, to_user, body, sent_at, read_at}]
     *
     * where to_user is
     *   {username, first_name, last_name, phone}
     */

    async messagesFrom() { 
        const results = await db.query(`SELECT id, to_username, body, sent_at, read_at
                                FROM messages
                                WHERE from_username=$1`,
                                [this.username])
        for (let row of results.rows) {
            const toUser = await db.query(`SELECT username, first_name AS "firstName", 
                                last_name AS "lastName", phone
                                FROM users
                                WHERE username=$1`,
                                [row.to_username])

            row.to_username = toUser.rows[0]
        }
        return results.rows
    }

    /** Return messages to this user.
     *
     * [{id, from_user, body, sent_at, read_at}]
     *
     * where from_user is
     *   {id, first_name, last_name, phone}
     */

    async messagesTo() {
        const results = await db.query(`SELECT id, from_username, body, sent_at, read_at
                                FROM messages
                                WHERE from_username=$1`,
                                [this.username])
        for (let row of results.rows) {
            const toUser = await db.query(`SELECT username, first_name AS "firstName", 
                                last_name AS "lastName", phone
                                FROM users
                                WHERE username=$1`,
                                [row.from_username])

            row.from_username = toUser.rows[0]
        }
        return results.rows
     }

    async save() {
        
        try{
            if (this.joinAt === undefined) {
                
              const result = await db.query(
                `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at )
                     VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING join_at, last_login_at`,
                [this.username, this.password, this.firstName, this.lastName, this.phone, new Date(), new Date()]
              );
              
              this.joinAt = result.rows[0].join_at;
              this.lastLoginAt = result.rows[0].last_login_at;
            
            } else {
              
                await db.query(
                    `UPDATE users SET password=$2, first_name=$3, last_name=$4, phone=$5, last_login_at=$6
                    WHERE username=$1`,
                    [this.username, this.password, this.firstName, this.lastName, this.phone, this.lastLoginAt]
                );
            }
        }
        catch(e) {
            if (e.code === '23505'){
               throw new ExpressError("Username Taken", 400)
            }
        }
    }

}   


module.exports = User;