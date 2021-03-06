const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");
const { User } = require("./../models/user");
const { todos, populateTodos, users, populateUsers } = require("./seed/seed");

/* Here below we're using the 'beforeEahc' method of MOCHA, this function will run BEFORE each test we have in
this file. So we're going to be able to run some code BEFORE every single test case, in our case we're going to
MAKE sure that our Database is EMPTY. This function is going to run BEFORE every test and it's ONLY going to 
move ON to the NEXT test case ONCE we called 'done', which means we can do something ASYNCHRONOUS inside this 
'beforeEach' function. Inside we use this 'remove' method that is SIMILAR to the method we have in the 'mongodb'
native, ALL we have to do is passing an EMPRY Object and this is going to WIPE ALL our "todos" from the Database.
With THIS in place our Database is going to be EMPTY before EACH request and NOW our assumption(the one that
we're STARTING with zero "todos", so with an EMPTY Database pretty much) is CORRECT */
beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test todo text";

    request(app)
      .post("/todos")
      .set("x-auth", users[0].tokens[0].token)
      // This Object INSIDE the 'send' method is going to be CONVERTED in JSON by 'supertest'
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        /* In this case we're going to find ONLY the 'todos' where the 'text' property EQUALS the 'text' we
        have ABOVE(so the 'text' variable we have under the 'describe') */
        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            /* Here we're expecting that the 'text' of the todos is the same as the one in the 'text' varialbe
            we just define here above */
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });

  // CHALLENGE
  it("should not create todo with invalid body data", done => {
    request(app)
      .post("/todos")
      .set("x-auth", users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        // Here with the 'find' method we're FETCHING ALL the 'todos' we have in our Collection
        Todo.find()
          .then(todos => {
            expect(todos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("GET /todos", () => {
  // This 'should get all todos' NOW refers to the TWO todo we just added at the TOP, so the 'todos' ARRAY
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(1);
      })
      /* In THIS case there is no need to pass a FUNCTION to this 'end' method like we did above because we're
      not doing  anything asynchronously */
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      /* The '_id' is an 'ObjectID' so we NEED a way to CONVERT it into a STRING, and we can do this with the
      'toHexString' method that will return our 'ObjectID' as a 24byte STRING representation */
      .get(`/todos/${todos[0]._id.toHexString()}`)
      /* Here below we're providing the 'token' for the FIRST user(the first OBJECT stored in the 'users' ARRAY
      inside the 'seed.js' file pretty much) which is the OWNER of the 'todo' we're trying to FETCH from our 
      Database */
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      // This below is a 'CUSTOM Expect' Call
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should not return todo doc created by other user", done => {
    request(app)
      /* In this TEST we're trying to FETCH the SECOND 'todo' item(and that's why we're using 'todos[1]' below) 
      BUT while be authenticated as the FIRST user(and this is why we have 'users[0].tokens[0].token' below) */
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set("x-auth", users[0].tokens[0].token)
      // For this reason we EXPECT a 404 and that will make our test PASS
      .expect(404)
      .end(done);
  });

  /* In this TEST we're providing a VALID 'ObjectID'(we're creating a new one with the 'new ObjectID' and then 
  we're converting it to a REAL 'id' so to a STRING) BUT this 'id' will NOT be present in our Database and so 
  we will throw a 404 status code error */
  it("should return 404 if todo not found", done => {
    /* Here below we're created a new 'ObjectID' and then CONVERTING it to a STRING, so we're creating a RANDOM
    'ObjectID' that will NOT be present in our Database, so when we use it down below will FAIL and our 404 
    expected error will be valid and so our whole TEST will PASS just like we want */
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  /* In this TEST instead we're passing an INVALID 'ObjectID', so the '123' below that is an INVALID 'ObjectID'
  because we KNOT that a VALID one has a VERY SPECIFIC structure(it's a 24 byte hex(esadecimale) STRING) and this
  '123' of course DOESN'T pass that CRITERIA */
  it("should return 404 for non-object ids", done => {
    request(app)
      /* This id we're passing in, so the '123' is NOT going to be inside our Database and is also NOT a VALID
      'ObjectID' because as we're already seen a valid 'ObjectID' has a very SPECIFIC structure(see below) */
      .get("/todos/123")
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      /* With this in place we've SUCCESSFULLY authenticated as the SECOND user who does indeed have access to
      the SECOND 'todo' because was created by him */
      .set("x-auth", users[1].tokens[0].token)
      // We're expecting to get a 200 because this 'hexId' is going to EXIST in our Database
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          // We pass the 'err' directly INSIDE the 'done function so that it gets rendered by MOCHA
          return done(err);
        }

        // The Document we're trying to find here below is the one that SHOULD have gotten deleted above
        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch(e => done(e));
      });
  });

  /* This TEST below should PASS if the user who is currently logged in is NOT the one who created the 'todo' 
  that we're trying to REMOVE, returning us a 404 */
  it("should not remove a todo created by other user", done => {
    var hexId = todos[0]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      /* In this case we're trying to delete the FIRST 'todo'(that why we have the 'todos[0]' inside the 'hexId'
      variable here above) while being logged in as the SECOND user, and we know that this should NOT be 
      possible */
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          // We pass the 'err' directly INSIDE the 'done function so that it gets rendered by MOCHA
          return done(err);
        }

        /* The Document we're trying to find here below is the one that SHOULD have gotten deleted above BUT 
        it has NOT been removed because AGAIN we're logged in as a DIFFERENT user from the one who created that
        'todo' */
        Todo.findById(hexId)
          .then(todo => {
            /* Here we're expecting our 'todo'(so the one we tried to REMOVE) to STILL exist, this because our
            ATTEMPT to remove the FIRST 'todo' should have FAILED because we're NOT logged in as the user who
            CREATED that 'todo', and so we EXPECT this FIRST 'todo' to EXIST */
            expect(todo).toBeTruthy();
            done();
          })
          .catch(e => done(e));
      });
  });

  /* In this case this TEST is going to be successfull, because we DON'T have any 'todos' in our Database with 
  THAT specific 'hexId'(that we're creating here below) and so the 404 status will be CORRECT and our TEST will 
  PASS correctly */
  it("should return 404 if todo not found", done => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  /* In this case instead we're passing an INVALID 'id' inside the URL(we're passing 123 that is an INVALID 'id')
  and so of course the test will be correct because we're just EXPECTING to get a 404 status, so also this test
  will PASS correctly */
  it("should return 404 if ObjectID is invalid", done => {
    request(app)
      .delete("/todos/123")
      .set("x-auth", users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update the todo", done => {
    var hexId = todos[0]._id.toHexString();
    var text = "this should be the new text";

    request(app)
      .patch(`/todos/${hexId}`)
      .set("x-auth", users[0].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        // expect(res.body.todo.completedAt).toBeA("number");
        expect(typeof res.body.todo.completedAt).toBe("number");
      })
      .end(done);
  });

  it("should not update the todo created by other user", done => {
    var hexId = todos[0]._id.toHexString();
    var text = "this should be the new text";

    request(app)
      .patch(`/todos/${hexId}`)
      .set("x-auth", users[1].tokens[0].token)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done);
  });

  it("should clear completedAt when todo is not completed", done => {
    var hexId = todos[1]._id.toHexString();
    var text = "this should be the new text!!";

    request(app)
      .patch(`/todos/${hexId}`)
      .set("x-auth", users[1].tokens[0].token)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

describe("GET /users/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      /* To SET a 'header' in "Supertest" we use the 'set()' method and it takes TWO arguments, this FIRST is 
      the 'header' NAME('x-auth' in our case) and the SECOND argument is the 'header' VALUE */
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        /* we're expecting that the '_id' that comes back from the 'body' should be the '_id' of the 'user' 
        whose 'token' we supplied */
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .expect(401)
      .expect(res => {
        // Here below we're expecting that the 'res.body' is equal to an EMPTY Object
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe("POST /users", () => {
  /* This call will TEST what happens when we pass in VALID Data, SO a valid 'email'(that is NOT already in use)
  and a VALID 'password' that the user created */
  it("should create a user", done => {
    var email = "example@example.com";
    var password = "123mnb!";

    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        /* In THIS case we need to use the BRACKETS notation(so this []) and NOT the dot notation(so this '.') 
        because our header name 'x-auth' CONTAINS an hyphen(this symbol '-') which will be INVALID if we use the
        dot notation */
        expect(res.headers["x-auth"]).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }

        // In this case we're ACTUALLY fetching a 'user' from OUR Database
        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            /* Here we expect that the 'user.password' does NOT equal the 'password' we used(the 'password' 
            variable we defined ABOVE) since it should have been HASHED */
            expect(user.password).not.toBe(password);
            done();
          })
          .catch(e => done(e));
      });
  });

  /* This call instead will TEST that when we pass in an INVALID 'email' or a 'password' that is NOT at least 
  of six characters, the user DOESN'T get created */
  it("should return validation errors if request invalid", done => {
    /* In this case we're expecting this TEST to PASS if we use INVALID Data, so if we pass an invalid 'password'
    (so a password that has LESS than six characters) AND an invalid 'email', and SO below here we just created 
    those two invalid data inside the 'send' function */
    request(app)
      .post("/users")
      .send({
        email: "and",
        password: "123"
      })
      .expect(400)
      .end(done);
  });

  /* In this test we're going to use an 'email' that's ALREADY in use, which means that we're going to TRY to
  sign up using one of the TWO 'emails' we've used in our SEED Data(so the email we've used inside the 'users'
  ARRAY in the 'seed.js' file, so we must use below one of these two "andrew@example.com" or "jen@example.com") */
  it("should not create user if email in use", done => {
    request(app)
      .post("/users")
      .send({
        email: users[0].email,
        password: "123mnb!"
      })
      .expect(400)
      .end(done);
  });
});

describe("POST /users/login", () => {
  it("should login user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            /* The 'toMatchObject' method(from the 'expect' library) let us CHECK if a JavaScript Object MATCHES
            a subset(sottoinsieme) of the properties of another object. In our case we're trying to CHECK if 
            this 'user.tokens[1]' OBJECT has the 'access' AND 'token' properties */
            expect(user.toObject().tokens[1]).toMatchObject({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => done(e));
      });
  });

  it("should reject invalid login", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        /* Because we're expecting to have INVALID data we just send an INVALID 'password' where we've added this
        value "1" pretty much to make the previous VALID password and INVALID one */
        password: users[1].password + "1"
      })
      .expect(400)
      .expect(res => {
        // Because we're passing INVALID Data we're expect that the 'x-auth' DOESN'T exist
        expect(res.headers["x-auth"]).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id)
          .then(user => {
            /* Here we expect that the LENGTH of the "tokens" array will be ONE because the DEFAULT length of 
            the 'tokens' array goes from ZERO(in the DEFAULT case when the 'tokens' Array is EMPTY) to ONE(in 
            THIS case because we ADDED this item and so the LENGTH of the 'tokens' Array will be one) */
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch(e => done(e));
      });
  });
});

/* In this 'describe' block we're going to TEST that when we SEND across a 'token' it get REMOVED from the 
'users' Collection we have in our Database. */
describe("DELETE /users/me/token", () => {
  /* This test is going to make sure that when a VALID 'x-auth' token gets passed across the log out METHOD it
  ACTUALLY does get log out */
  it("should remove auth token on logout", done => {
    request(app)
      .delete("/users/me/token")
      // Here we're SETTING this 'x-auth' to have a value equal to 'users[0].tokens[0].token'
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
