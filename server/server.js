var express = require("express");
var bodyParser = require("body-parser");

/* Here we're using the ES6 'Destructuring' feature to PULL OFF the 'moongose' property, essentially we're 
creating a LOCAL Variable called 'mongoose' EQUAL to the 'moongose' property on the OBJECT inside the 
'mongoose.js'(the Object that we're EXPORTING with 'module.export' inside 'mongoose.js' pretty much) file and 
THAT Object is going to be the RETURN result from requiring the file we JUST created, so the 'mongoose.js' file */
var { mongoose } = require("./db/mongoose");
var { Todo } = require("./models/todo");
var { User } = require("./models/user");

var app = express();

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

app.listen(3000, () => {
  console.log("Started on port 3000");
});
