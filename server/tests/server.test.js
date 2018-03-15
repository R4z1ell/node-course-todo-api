const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");

/* BEFORE we can actually write the test for the 'GET /todos'(the one we have all the way below) we have to deal
witha a problem. The FIRST thing we do inside the 'beforeEach' function is to DELETE everything from the Database
,so we're removing ALL the "todos" and this happens before EACH test. Now, the 'get /todos' ROUTE inside the
'server.js' file pretty much LIVES OFF the fact that there are "todos" that he CAN return, it will handle the
case where we have NO "todos" BUT in our case we DO want some data in the Database. In order to ADD this Data 
we're going to MODIFY the 'beforeEach' function by ADDING some 'Seed' Data, this means that our Database is STILL
going to be predictable(so it will ALWAYS look the same when we start the server) BUT we will have SOME items
in it. Now in order to do that the FIRST thing that we're going to do is make a NEW Array of "dummy" todos, these
todos ONLY need the 'text' property since EVERYTHING else will be populated by mangoose. So we create this 'todos'
Array below with TWO "dummy" elements in it, BEFORE we can actually write our TEST we have to MODIFY the
'beforeEach' method using a brand new METHOD of mongoose called 'insertMany' which takes an ARRAY(so exactly like
the 'todos' we just created here below) and INSERTS all of those documents INTO our Collection. This means that
we're going to need to TWEAK our code inside the 'beforeEach' function below. */
const todos = [
  {
    // We've added these '_id' so that in the "GET /todos/:id" describe TEST below we can ACCESS these '_id'
    _id: new ObjectID(),
    text: "First test todo"
  },
  {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 333
  }
];

/* Here below we're using the 'beforeEahc' method of MOCHA, this function will run BEFORE each test we have in
this file. So we're going to be able to run some code BEFORE every single test case, in our case we're going to
MAKE sure that our Database is EMPTY. This function is going to run BEFORE every test and it's ONLY going to 
move ON to the NEXT test case ONCE we called 'done', which means we can do something ASYNCHRONOUS inside this 
'beforeEach' function. Inside we use this 'remove' method that is SIMILAR to the method we have in the 'mongodb'
native, ALL we have to do is passing an EMPRY Object and this is going to WIPE ALL our "todos" from the Database.
With THIS in place our Database is going to be EMPTY before EACH request and NOW our assumption(the one that
we're STARTING with zero "todos", so with an EMPTY Database pretty much) is CORRECT */
beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe("POST /todos", () => {
  it("should create a new todo", done => {
    var text = "Test todo text";

    request(app)
      .post("/todos")
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
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
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
      .expect(200)
      // This below is a 'COMMON Expect'
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  /* In this TEST we're providing a VALID 'ObjectID'(we're creating a new one with the 'new ObjectID' and then 
  we're converting it to a REAL 'id' so to a STRING) BUT this 'id' will NOT be present in our Database and so 
  we will throw a 404 status code error */
  it("should return 404 if todo not found", done => {
    // Here below we're created a new 'ObjectID' and then CONVERTING it to a STRING
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done);
  });

  /* In this TEST instead we're passing an INVALID 'ObjectID', so the '123' below that is an INVALID 'ObjectID'
  because we KNOT that a VALID one has a VERY SPECIFIC structure(it's a 24 byte hex(esadecimale) STRING) and this
  '123' of course DOESN'T pass that CRITERIA */
  it("should return 404 for non-object ids", done => {
    request(app)
      .get("/todos/123")
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    var hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
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
            expect(todo).toNotExist();
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
      .expect(404)
      .end(done);
  });

  /* In this case instead we're passing an INVALID 'id' inside the URL(we're passing 123 that is an INVALID 'id')
  and so of course the test will be correct because we're just EXPECTING to get a 404 status, so also this test
  will PASS correctly */
  it("should return 404 if ObjectID is invalid", done => {
    request(app)
      .delete("/todos/123")
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
      .send({ 
        completed: true,
        text 
       })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA("number");
      })
      .end(done);
  });

  it("should clear completedAt when todo is not completed", done => {
    var hexId = todos[1]._id.toHexString();
    var text = "this should be the new text!!";

    request(app)
      .patch(`/todos/${hexId}`)
      .send({ 
        completed: false,
        text 
       })
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      })
      .end(done);
  });
});