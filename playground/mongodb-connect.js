/* Here we're pulling out the 'MongoClient' from the 'mongodb' library we just downloaded, this 'MongoClient'
will let us CONNECT to a "Mongo SERVER" and issue commands to MANIPULATE the database */
// const MongoClient = require("mongodb").MongoClient;
/* Here below we're using 'Object destructuring' to create a NEW variable called 'MongoClient', so with 
destructuring we can pull off ANY property from this 'mongodb' library and in THIS case we want to pull off
the 'MangoClient' property , this CREATE a variable called 'MongoClient' and setting it EQUAL to the 
'MongoClient' property of 'require("mongodb") which is EXACTLY what we did above here, so this new code created
with DESTRUCTURING is the SAME as the previous code 'const MongoClient = require("mongodb").MongoClient;'.
So NOW that we've destructuring in place we can EASILY pull off MORE things from 'mongodb', we just add a comma
',' after Mongoclient and SPECIFY something else we want to pull off, in this case we're going to pull off
'ObjectID'. This 'ObjectID' CONSTRUCTOR function let us create NEW 'ObjectID' on the FLY */
const {MongoClient, ObjectID} = require("mongodb");

/* By using the 'new' keyword we CREATE a NEW instance of 'ObjectID' */
// var obj = new ObjectID();
// console.log(obj); // 5aa5592058943617e4e51ca7 , so we just got a NEW UNIQUE 'ObjectID' value pretty much

/* Here below we're going to use a feature of ES6 called 'OBJECT DESTRUCTURING' that we'll let us PULL OUT 
properties from an Object creating VARIABLES. This means that if we have for example an Object called 'user'
with a 'name' and 'age' property we can EASILY pull out ONE of these value INTO a variable, let's say that we
want to pull out the 'name' property and create a 'name' variable, to do that using 'Object Destructuring' we're
going to create a variable and WRAP IT inside curly braces, inside these curly braces we're going to PROVIDE
the property we want to pull out(so 'name' in our case, that is going to be ALSO the variable name reference)
and set it EQUAL to whatever Object we want to DESTRUCTURE(in our case is the 'user' Object), and this is all.
So we have SUCCESSFULLY restructured the 'user' Object pulling off(tirando fuori) the 'name' property, creating
a NEW 'name' variable and setting it equal to whatever the value of it was in the 'user' Object. So ES6 
destructuring is a fantastic way to make NEW variables from an object's properties */
// var user = { name: "Andrew", age: 25};
// var {name} = user;
// console.log(name); // Andrew

/* With the 'MongoClient' now in place we can NOW call the 'connect()' method to CONNECT to the Mongo Database.
This 'connect' method takes TWO arguments, the FIRST arguments is a string that is going to be the URL where our
Database LIVES(so our localhost URL in this case), the SECOND argument is going to be a Callback Function that
will FIRE after the connection has either SUCCEEDED or FAILED. If the connection FAILED we'll print a message
and STOP the program, if it SUCCEEDED we can start MANIPULATING the Database. In the Callback we pass TWO 
arguments, the FIRST one is going to be an 'err'(error) argument that may or may NOT exist, so if we have an
error it will EXIST otherwise it won't, the SECOND argument is going to be the 'db' Object(it's 'client' for
the LATEST version of the 'mongodb' package, so the 3.0 version) that we'll use to ISSUE all the commands to 
READ and WRITE data */
MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    /* This return statement is used to PREVENT the REST of this function from EXECUTING, which means that if
    an ERROR occur the "Unable to connect to MongoDB server" message will log and the program will STOP, so we
    will NEVER see the OTHER message(the "Connected to MongoDB server"). If we DON'T use this return statement
    when we LOG an error message we will ALSO see the OTHER message but that is NOT what we want, so to PREVENT
    this behavior we use the 'return' statement that will STOP our program from further execute the other code */
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  // This is the REFERENCE to the Database that we need to use because we're on the latest version of 'mongodb'
  const db = client.db("TodoApp");

  /* This 'collection()' method takes as his ONLY argument the STRING name for the COLLECTION we want to INSERT
  into. Now like the ACTUAL Database itself(so the 'TodoApp') we DON'T need to create this collection FIRST, we
  can simply give it a name like 'Todos' and start inserting into it, there is no need to run any command to 
  create it. So now we use the 'insertOne' method that is available on the 'collection' method, this 'insertOne'
  method let us INSERT a new document into our Collection, it takes TWO arguments. The FIRST one is going to be
  an Object that will store the various key-value pairs we want to have on our Document and the SECOND one is
  going to be a Callback Function that will get fired when things either FAILS or go WELL. The Callback itself
  will take an 'err' argument that may or may not exist and we'll also have a 'result' argument which is going
  to be provided if things went well, INSIDE of the Callback we'll have the code to handle the error and also
  some code to PRINT the Object to the screen if it was added SUCCESSFULLY */
  //   db.collection("Todos").insertOne(
  //     {
  //       text: "Something to do",
  //       completed: false
  //     },
  //     (err, result) => {
  //       if (err) {
  //         // here we return the error message AND the error ITSELF
  //         return console.log("Unable to insert todo", err);
  //       }
  //       /* This 'result.ops' attribute is going to store ALL the docs that were INSERTED, in our case we used the
  //       'insertOne' method so it's JUST going to be ONE document, THEN we use 'undefined' for the Filter Function
  //       and 2 for the INDENTATION, with this in place we can now EXECUTE our file and see what happens */
  //       console.log(JSON.stringify(result.ops, undefined, 2));
  //     }
  //   );

  // db.collection("Users").insertOne(
  //   {
  //     name: "R4z1ell",
  //     age: 35,
  //     location: "Italy"
  //   },
  //   (err, result) => {
  //     if (err) {
  //       return console.log("Unable to insert user", err);
  //     }

  //     // 'result.ops' is an ARRAY of ALL the Documents that got INSERTED
  //     // console.log(JSON.stringify(result.ops, undefined, 2));
  //     /* This 'result.ops' is an ARRAY of ALL the Documents that got INSERTED, so here below we're going to
  //     ACCESS the FIRST item in this Array and THEN access the '_id' property, so now if re re-run this file
  //     through the terminal we se the 'ObjectId'(the 'ObjectId' is the VALUE of the '_id' property, is called
  //     like this in mongoDB) printed to the screen. Now we add the 'getTimestamp' function also and call it, this
  //     function DOESN'T take any argument, it simply returns the TIME STAMP(data e ora) that the 'ObjectId' was
  //     CREATED,now if we rerun our program we get the time stamp(like this '2018-03-11T15:55:35.000Z') where we
  //     can see that the 'ObjectId' was created on March 11th 2018 at 15:55. Now we DON'T have to RELY on MongoDB
  //     to CREATE our 'ObjectId' because INSIDE of the MongoDB Library we have actually a FUNCTION that we can run
  //     to make an 'ObjectId' whenever we like */
  //     console.log(result.ops[0]._id.getTimestamp());
  //   }
  // );

  // This 'close()' method will simply CLOSE the connection with our Database
  client.close();
});
