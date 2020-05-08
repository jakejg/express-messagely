const accountSid = 'ACaee60dedec560b4591b4394772f8b501';
const authToken = '1c5f39e6f3ed4da5a9abcd8bfa076427';
const client = require('twilio')(accountSid, authToken);

module.exports = client;