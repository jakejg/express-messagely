const accountSid = 'ACaee60dedec560b4591b4394772f8b501';
const authToken = 'Your_auth_token';
const client = require('twilio')(accountSid, authToken);


module.exports = client;