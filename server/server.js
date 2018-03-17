require("./config/config");

const _ = require("lodash");
const express = require("express");
const { ObjectID } = require("mongodb");
/* "body-parser" is used to PARSE the 'request' bodies. So if a 'request' is sent to the server with JSON,
'body-parser' will CONVERT the string JSON data into a JavaScript Object */
const bodyParser = require("body-parser");

/* Here we're using the ES6 'Destructuring' feature to PULL OFF the 'moongose' property, essentially we're 
creating a LOCAL Variable called 'mongoose' EQUAL to the 'moongose' property on the OBJECT inside the 
'mongoose.js'(the Object that we're EXPORTING with 'module.export' inside 'mongoose.js' pretty much) file and 
THAT Object is going to be the RETURN result from requiring the file we JUST created, so the 'mongoose.js' file */
var { mongoose } = require("./db/mongoose");
var { Todo } = require("./models/todo");
var { User } = require("./models/user");
var { authenticate } = require("./middleware/authenticate");

var app = express();
/* The 'process.env.PORT' is the variable that MAY or may NOT be SET and it's going to be set IF the 'app' is
running on HEROKU */
const port = process.env.PORT;

/* Here below we're setting the MIDDLEWARE, this 'json' method will return a FUNCTION and THAT is the Middleware
that we NEED to give to 'Express'. With this in place we can now send JSON to our Express application */
app.use(bodyParser.json());

/* Now with all of this in place we have a very basic server and ALL we have to do is start CONFIGURING our
ROUTES. The first ROUTE we're going to be focusing on is the 'POST'Route that is going to let us CREATE new
'todo'. Now INSIDE of our 'REST Api' there's the basic 'CRUD Operations'(CRUD stands for 'Create Read Update 
Delete) and when we want to CREATE a new Resource we use the 'POST' Http method and we send that resoruce as the
BODY. This means that when we want to make a new 'todo' we're going to send a JSON Object over to the Server 
with a 'text' property, the server is going to take that 'text' property, create a new MODULE and send the
COMPLETE Module(with all the other property like '_id', 'completed' and so on) BACK to the client. To set up a
Route we need to cakk 'app.post()', the 'post' method take the URL as first argument and the Callback Function
as second argument that gets called with the 'req' and 'res' Objects. Now we need to GET the BODY Data that got
sent from the CLIENT and for doing this we have to use the 'body-parser' module we just downloaded, 'body-parser'
is going to take our JSON and CONVERT it into an Object ATTACHING it onto this 'req'(request) Object  */
app.post("/todos", (req, res) => {
  //console.log(req.body); // This is the body that gets STORED by 'body-parser'
  var todo = new Todo({
    text: req.body.text
  });

  todo.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/todos", (req, res) => {
  Todo.find().then(
    todos => {
      /* This 'todos' that we're passing is an ARRAY and when we pass BACK an Array we're kind of LOCKING ourself
    down because if for example we want to ADD another property we CAN'T because we have an Array. The BETTER
    solution is to CREATE an Object and on that Object SPECIFY 'todos' to be EQUAL to the 'todos' ARRAY with the 
    ES6 way. THIS will let us ADD other properties LATER ON, so by using an Object INSTEAD of an Array we're 
    opening ourselves up to a more FLEXIBLE future, with THIS in place our SUCCESS case is good to go.
    Now if we run our application with the following code 'node .\server\server.js' and then we go on POSTMAN
    we can SEND a 'GET' request to this URL 'localhost:3000/todos' and we will see that we get back an EMPTY
    Array because we previously WIPED OUT(cancellat) our ENTIRE Database with the 'beforeEach' function inside
    the 'server.test.js' file. */
      res.send({ todos });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

// CHALLENGE
app.get("/todos/:id", (req, res) => {
  var id = req.params.id;

  /* This code will FIRE if we pass an INVALID 'ObjectID'(so when the VALUE is in a DIFFERENT format,for example
  it has a length that is LESS or MORE than the valid one) */
  if (!ObjectID.isValid(id)) {
    /* this 'return' is used to PREVENT ther OTHER code from executing, also the 'send' function is EMPTY so 
    that we're able to send back an empty BODY */
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        // This error will be thrown when we pass a VALID 'ObjectID' BUT it DOESN'T math ANY of our Document
        return res.status(404).send();
      }
      /* Here we're passing the 'todo' as sn OBJECT using the ES6 way(so instead of using the classic 'todo: todo'
      we can pass just 'todo' because  we have the SAME value for both key and value), we could have passed the 
      'todo' just WITHOUT the Object(so just passing it as a normal argument like this 'send(todo)') but IF we 
      pass it INSIDE the Object we would have MORE flexibility so that if we want we could ADD other properties
      for example like custom status code or anything else */
      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

app.delete("/todos/:id", (req, res) => {
  // 'params' is where ALL our URL parameters are STORED, and THEN we get them by value
  var id = req.params.id;

  // IF the 'id' is NOT valid we return an 404 status
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

// 'patch' is WHAT we use when we want to UPDATE a Resource
app.patch("/todos/:id", (req, res) => {
  var id = req.params.id;
  /* THIS is the reason why we downloaded and added the 'lodash' package. In this 'body' is where we'll STORE 
  our UPDATES, so if we want to SET the 'text' of one of our 'todo' to something ELSE we would make a 'patch'
  REQUEST and we would set the 'text' property equal to WHATEVER we want this 'text' to BE. The problem here is
  that someone can send ANY property along, so they could send along properties that we DON'T want them to 
  UPDATE for example the 'completedAt' property that is going to be updated BUT not from the user, it's going to
  be updated by US when the user UPDATE the 'completed' property, 'completedAt' will be generated by the program
  which means we DON'T want that an user is able to update it. In order to pull off JUST the properties we want
  the user to update we're going to be using the '_.pick' method(coming from the 'lodash' library we just added) 
  that takes an OBJECT as FIRST parameter and an ARRAY of properties we WANT to pull off as SECOND argument IF
  they EXIST. For example IF the 'text' property EXIST we WANT to pull that off from 'req.body' and ADDING it to
  the 'body' variable because this is something that the user SHOULD be able to UPDATE and we'll do the SAME for
  the 'completed' property and THESE are the only two properties that the user is going to be able to UPDATE, we
  DON'T need the user to update other property like 'id' or ADDING any other properties that AREN'T specified in
  the 'mongoose' MODEL(So the 'todo.js' MODEL inside the 'models' folder). Now that we've THIS in place we can
  get started by VALIDATING our 'id' */
  var body = _.pick(req.body, ["text", "completed"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  /* NOW we can start with the slightly COMPLEX part of this 'PATCH' Route which is going to be CHECKING the
  'completed' property value and USING that value to SET the 'completedAt' property. So if a user is setting a 
  todo's 'completed' property to TRUE we want to set 'completedAt' to a timestamp(A timestamp is a SEQUENCE of 
  characters or ENCODED information identifying WHEN a certain event OCCURRED(si è verificato), usually giving 
  date and time of day, sometimes accurate to a small fraction of a second) and IF they're setting it to FALSE 
  we want to CLEAR that timestamp because the 'todo' WON'T be completed. Now we're going to CHECK inside an if
  statement using the '_.isBooleand' Utility method of 'lodash' IF the 'completed' property on this 'body' 
  variable here above IS a Boolean AND if it's TRUE. */
  if (_.isBoolean(body.completed) && body.completed) {
    /* When BOTH the above statement are TRUE we'll SET the 'completed' property to the CURRENT timestamp BUT
    this time INSTEAD of using the 'toString' method we used before we're going to use a new method called 
    'getTime' that RETURN a JavaScript timestamp that is the NUMBER of milliseconds since midnight of January
    1st of the year 1970, so it's just a REGULAR Number where values GREATER than zero are milliseconds from
    THAT moment FORWARD and values LESS than zero are in the past, so if we had a number like -1000 it would be
    1000 milliseconds BEFORE that 'UNIX EPOCH'(is the name for that date January 1st at midnight of the year
    1970) */
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null; // When we want to REMOVE a value from the Database we simply set it to 'null'
  }

  /* The FIRST argument for 'findByIdAndUpdate' is going to be the 'id' ITSELF, on the SECOND argument we've our
  Object and REMEMBER that we CAN'T just set key-value pairs BUT we MUST use the 'MongoDB Operators' like '$set'
  that as we know TAKES key-value pairs and now THESE are going to get set by us, in THIS case though we've
  ALREADY generated the Object inside the 'body' variable above so we just set the '$set' OPERATOR to the 'body'
  variable. NOW we can go ahead and DEFINE the 'option' Object(that THIRD argument pretty much) where we can 
  SPECIFY some options that let us tweak HOW the function WORKS, so in here we're going to use an option that is
  SIMILAR to 'returnOriginal'(that we used in the 'mongodb-update.js' file to RETURN the UPDATED Object to the 
  terminal) and is called just 'new'(it has SIMILAR functionality to 'returnOriginal' it just has a DIFFERENT
  name because that's what the mongoose developers chose to use), so now with this QUERY in place we're DONE,
  we can attach a 'then' callback and a 'catch' callback to handle our SUCCESS and ERROR code */
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(todo => {
      // IF the 'todo' DOESN'T exist we send this '404'
      if (!todo) {
        return res.status(404).send();
      }

      /* INSTEAD if the 'todo' does EXIST, that means we were able to find it and it was UPDATED we can simply send
    it BACK to the user using the ES6 way as always(todo: todo => becomes just 'todo') */
      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

// 'SIGN UP' Route
app.post("/users", (req, res) => {
  var body = _.pick(req.body, ["email", "password"]);
  var user = new User(body);

  user
    .save()
    .then(() => {
      /* we can RETURN it since we know THAT we're expecting a CHAINING promise and we can tack on ANOTHER 'then'
      Callback where we can pass in the 'token' because THAT is what got returned from 'user.generateAuthToken()'
      Now we have everything we need to make the response, we have the 'user' and we have the 'token' */
      return user.generateAuthToken();
    })
    .then(token => {
      /* The 'header' function takes TWO arguments that are key-value pairs, the KEY is the header name and the
      value is the value we want to set the header to. Our header name is going to 'x-auth', when we PREFIX a
      header with the 'x-' we create a CUSTOM header which menas it's NOT necessarily a header that HTTP supports
      by DEFAULT but it's a header that we're using for ouse SPECIFIC purposes, in our application for example 
      we're using a "Json Token Scheme" so we're creating a CUSTOM header to store THAT value, next up we can 
      pass the 'token' */
      res.header("x-auth", token).send(user);
    })
    .catch(e => res.status(400).send(e));
});

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

/* This ROUTE below is going to be a DEDICATED Route for logging in EXISTING users. Currently the ONLY way we
ca get an 'x-auth' token BACK is by using the 'SIGN UP' call(the 'Sign Up' Route above), so if we LOSE the token
OR we sign in from a DIFFERENT device obviously we WANT to be able to get a NEW one and currently this is just 
NOT possible. We can't make another call to the 'SIGN UP' Route because the 'email' ALREADY exists so the call is
going to return a 400, so what we NEED is a DEDICATED Route for logging in users. Also we're NOT passing in the
'authenticate' middleware because we DON'T have a token but we're trying to get one, that is the WHOLE purposes
of THIS call. */
app.post("/users/login", (req, res) => {
  /* We're going to need to FIND a user INSIDE the 'user' Collection we have on our MongoDB Database who has an
 'email' MATCHING the 'email' we sent in and has a HASHED 'password' that EQUALS the plain text 'password' when
 passed THROUGH the 'bcrypt' method we used inside the 'hashing.js' file. There we used the 'bcrypt.compare' 
 method to COMPARE a plain text 'password' with a HASH value, and THAT is EXACTLY what we're going to do now
 to make this Route WORK */
  var body = _.pick(req.body, ["email", "password"]);

  User.findByCredentials(body.email, body.password).then(user => {
    return user.generateAuthToken().then(token => {
      res.header("x-auth", token).send(user);
    });
  }).catch(e => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };
