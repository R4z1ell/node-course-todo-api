var express = require("express");
const { ObjectID } = require("mongodb");
/* "body-parser" is used to PARSE the 'request' bodies. So if a 'request' is sent to the server with JSON,
'body-parser' will CONVERT the string JSON data into a JavaScript Object */
var bodyParser = require("body-parser");

/* Here we're using the ES6 'Destructuring' feature to PULL OFF the 'moongose' property, essentially we're 
creating a LOCAL Variable called 'mongoose' EQUAL to the 'moongose' property on the OBJECT inside the 
'mongoose.js'(the Object that we're EXPORTING with 'module.export' inside 'mongoose.js' pretty much) file and 
THAT Object is going to be the RETURN result from requiring the file we JUST created, so the 'mongoose.js' file */
var { mongoose } = require("./db/mongoose");
var { Todo } = require("./models/todo");
var { User } = require("./models/user");

var app = express();
/* The 'process.env.PORT' is the variable that MAY or may NOT be SET. It's going to be set IF the 'app' is
running on HEROKU, it WON'T be set if it's running LOCALLY(so on port 3000). So IF 'process.env.PORT' is THERE
we're going to USE it, if it's not we'll use the 'port' 3000 INSTEAD */
const port = process.env.PORT || 3000;

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
  Todo.find().then((todos) => {
    /* This 'todos' that we're passing is an ARRAY and when we pass BACK an Array we're kind of LOCKING ourself
    down because if for example we want to ADD another property we CAN'T because we have an Array. The BETTER
    solution is to CREATE an Object and on that Object SPECIFY 'todos' to be EQUAL to the 'todos' ARRAY with the 
    ES6 way. THIS will let us ADD other properties LATER ON, so by using an Object INSTEAD of an Array we're 
    opening ourselves up to a more FLEXIBLE future, with THIS in place our SUCCESS case is good to go.
    Now if we run our application with the following code 'node .\server\server.js' and then we go on POSTMAN
    we can SEND a 'GET' request to this URL 'localhost:3000/todos' and we will see that we get back an EMPTY
    Array because we previously WIPED OUT(cancellat) our ENTIRE Database with the 'beforeEach' function inside
    the 'server.test.js' file. */
    res.send({todos})
  }, e => {
    res.status(400).send(e);
  });
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

  Todo.findById(id).then(
    todo => {
      if (!todo) {
        // This error will be thrown when we pass a VALID 'ObjectID' BUT it DOESN'T math ANY of our Document 
        return res.status(404).send();
      }  
      /* Here we're passing the 'todo' as sn OBJECT using the ES6 way(so instead of using the classic 'todo: todo'
      we can pass just 'todo' because  we have the SAME value for both key and value), we could have passed the 
      'todo' just WITHOUT the Object(so just passing it as a normal argument like this 'send(todo)') but IF we 
      pass it INSIDE the Object we would have MORE flexibility so that if we want we could ADD other properties
      for example like custom status code or anything else */
      res.send({todo});
    }).catch(e => {
      res.status(400).send();
    })
});

app.delete("/todos/:id", (req, res) => {
  // 'params' is where ALL our URL parameters are STORED, and THEN we get them by value 
  var id = req.params.id;

  // IF the 'id' is NOT valid we return an 404 status
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then(
    todo => {
      if (!todo) {
        return res.status(404).send();
      }

      res.send(todo);
    }).catch(e => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };
