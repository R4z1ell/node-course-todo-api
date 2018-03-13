const expect = require("expect");
const request = require("supertest");

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
    text: "First test todo"
  },
  {
    text: "Second test todo"
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

