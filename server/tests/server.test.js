const expect = require("expect");
const request = require("supertest");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");

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
move ON to the test case ONCE we called 'done', which means we can do something ASYNCHRONOUS inside this 
'beforeEach' function. Inside we use this 'remove' method that is SIMILAR to the method we have in the 'mongodb'
native, ALL we have to do is passing an EMPRY Object and this is going to WIPE ALL our "todos" from the Database.
With THIS in place our Database is going to be EMPRY before EACH request and NOW our assumption(the one that
we're STARTING with zero "todos", so with an EMPRY Database pretty much) is CORRECT */
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
