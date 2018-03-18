const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Todo } = require("./../../models/todo");
const { User } = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
// This is going to be our 'users' array we add as our SEED Data
const users = [
  {
    _id: userOneId,
    email: "andrew@example.com",
    password: "userOnePass",
    tokens: [
      {
        access: "auth",
        /* Remember that we HAVE to provide the exact SAME 'secret' we used in the 'generateAuthToken' function
        inside the 'user.js' file, and that 'secret' was 'abc123' so we put it down here */
        token: jwt.sign({ _id: userOneId, access: "auth" }, "abc123").toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "jen@example.com",
    password: "userTwoPass",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userTwoId, access: "auth" }, "abc123").toString()
      }
    ]
  }
];

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
    text: "First test todo",
    _creator: userOneId
  },
  {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 333,
    _creator: userTwoId
  }
];

const populateTodos = done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

/* Currently in the 'populateTodos' function above se use the 'insertMany' method to INSERT the 'todos'(so our
Documents) into the Database BUT in this case(so in this 'populateUsers' function) it will NOT work because the
'insertMany' function will NOT run our MIDDLEWARE, which means that when we INSERT these records the plain text
'password' is going to get stored in the Database and THAT is going to cause some problem later when we try to
TEST things because our test are going to ASSUME that the 'password' was PROPERLY hashed. So in order to SAVE
the 'users' const above(so our TWO users that we created above pretty much) and ALSO have our 'password' HASHED
we're going to TWEAK how we create this 'populateUsers' function below */
const populateUsers = done => {
  /* So things starts pretty much the same as in the 'populateTodos' function, we start by WIPING OUT(cancellando)
  ALL the 'users' inside the Database by calling 'Users.remove({})' where we pass that EMPTY Object that will
  remove EVERY single Document. The VALUE that gets returned by the 'save' function is what will be saved in the
  'userOne' variable and as we know THAT returned value is a PROMISE, so we can attach a 'then' call to it. So
  NOW we've pretty much TWO Promises('userOne' and 'usersTwo') and we want to wait for BOTH of them to SUCCEED,
  and there is actually a "Promise Utility" Method that let us just DO THAT. It's called 'Promise.all', it takes
  an ARRAY of Promises SO we can pass in our 'userOne' and 'userTwo' promises and THEN we can call the 'then'
  Callback that is NOT going to get fired UNTIL ALL of those Promises RESOLVE, in our case this means that BOTH
  'userOne' and 'userTwo' were SAVED to the Database. By calling 'save()' we're going to be running the Middleware
  AND by using the 'Promise.all' we'll be able to WAIT for all those 'save()' functions to COMPLETE. So NOW with
  this in place we're done, we can run our TEST and see exactly what kind of data we have in 'RoboMongo' */
  User.remove({})
    .then(() => {
      var userOne = new User(users[0]).save(); // This is a Promise
      var userTwo = new User(users[1]).save(); // This is a Promise

      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { todos, populateTodos, users, populateUsers };
