const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");


describe("Test User class", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    let u = await User.register({
      username: "test",
      password: "fake_password",
      firstName: "Test",
      lastName: "Testy",
      phone: "+14155550000",
    });
    await u.save()
  });

  test("can register", async function () {
    let u = await User.register({
      username: "joel",
      password: "fake_password",
      firstName: "Joel",
      lastName: "Burton",
      phone: "+14155551212",
    });

    expect(u.username).toBe("joel");
    expect(u.password).not.toBe(undefined);
  });

  test("can authenticate", async function () {
    let isValid = await User.authenticate("test", "fake_password");
    expect(isValid).toBeTruthy();

    isValid =  await User.authenticate("test", "xxx");
    expect(isValid).toBeFalsy();
  });


  test("can update login timestamp", async function () {
    await db.query("UPDATE users SET last_login_at=NULL WHERE username='test'");
    let u = await User.get("test");
    expect(u.lastLoginAt).toBe(null);

    let u2 = await User.get("test");
    u2.updateLoginTimestamp();
    
    await u2.save();
    expect(u2.lastLoginAt).not.toBe(null);
  });

  test("can get", async function () {
    let u = await User.get("test");
    expect(u.username).toEqual("test");
    expect(u.phone).toEqual("+14155550000");
    expect(u.joinAt).toEqual(expect.any(Date));
  });

  test("can get all", async function () {
    let u = await User.all();
    expect(u.length).toEqual(1);
    expect(u[0].username).toEqual("test");
  });
});

// describe("Test messages part of User class", function () {
//   beforeEach(async function () {
//     await db.query("DELETE FROM messages");
//     await db.query("DELETE FROM users");
//     await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");

//     let u1 = await User.register({
//       username: "test1",
//       password: "password",
//       firsName: "Test1",
//       lasName: "Testy1",
//       phone: "+14155550000",
//     });
//     let u2 = await User.register({
//       username: "test2",
//       password: "password",
//       firstName: "Test2",
//       lastName: "Testy2",
//       phone: "+14155552222",
//     });
//     let m1 = await Message.create({
//       from_username: "test1",
//       to_username: "test2",
//       body: "u1-to-u2"
//     });
//     let m2 = await Message.create({
//       from_username: "test2",
//       to_username: "test1",
//       body: "u2-to-u1"
//     });
//   });

//   test('can get messages from user', async function () {
//     let m = await User.messagesFrom("test1");
//     expect(m).toEqual([{
//       id: expect.any(Number),
//       body: "u1-to-u2",
//       sent_at: expect.any(Date),
//       read_at: null,
//       to_user: {
//         username: "test2",
//         firstName: "Test2",
//         lastName: "Testy2",
//         phone: "+14155552222",
//       }
//     }]);
//   });

//   test('can get messages to user', async function () {
//     let m = await User.messagesTo("test1");
//     expect(m).toEqual([{
//       id: expect.any(Number),
//       body: "u2-to-u1",
//       sent_at: expect.any(Date),
//       read_at: null,
//       from_user: {
//         username: "test2",
//         firstName: "Test2",
//         lastName: "Testy2",
//         phone: "+14155552222",
//       }
//     }]);
//   });
// });

afterAll(async function() {
  await db.end();
});
