//copy the link from "To connect using a driver via the standard MongoDB URI" section
//insert db user name and password here
const REMOTE_MONGO = "mongodb://R4z1ell:123@ds111319.mlab.com:11319/node-todo-api";
const LOCAL_MONGO = "mongodb://localhost:27017/TodoApp";
const MONGO_URI = process.env.PORT ? REMOTE_MONGO : LOCAL_MONGO;

const mongoose = require("mongoose");

/* 'mongoose' by DEFAULT supports Callback BUT we WANT to continue using PROMISES because they're a LOT simpler 
to CHAIN and manage. So for this reason we NEED to add this code right below where we're going to tell 'mongoose'
WHICH Promise Library we WANT to use and that is the BUILT IN Promise Library as opposed to some third party one.
This is something we ONLY need to do ONCE, we just add this code here in 'server.js' and we DON'T have to do the
same ANYWHERE else. With THIS in place NOW 'mongoose' is CONFIGURED, we CONNECTED it to our Database and we set
it up to USE 'Promises' which is EXACTLY what we want */
mongoose.Promise = global.Promise;

/* This below is HOW we can connect the 'mongoose' library to our MongoDB Database, as we can see the PROCESS
of connecting is pretty SIMILAR to what we did with the 'mongodb Driver Node.js'(so the 'mongodb' package we
added to our 'package.json' file pretty much and that we used for the files INSIDE the 'playground' folder).
So in BOTH cases we just passed in the URL of our Database("mongodb://localhost:27017/TodoApp" where 'TodoApp'
is the ACTUAL name that we choose for the Database) and NOW comes the part where the TWO functions DIFFER, the
'MongoClient.connect' method takes a CALLBACK Function and THAT is HOW we have access to the Database, the
'mongoose.connect' method INSTEAD is a LOT more complex and this is good because it means that our code can be
a lot more SIMPLER. 'mongoose' MAINTAIN the connection to our Database OVER TIME, so imagine that we try to
save something on our Database, now by the time that THIS statement RUNS 'mongoose.connect' is NOT going to have
had time to make a Database REQUEST to connect, this is going to take a few milliseconds AT LEAST. This statement
is going to run almost RIGHT AWAY, behind the scenes 'mongoose' is going  to WAIT for the connection BEFORE it
ever actually TRIES to make the query and THIS is one of the GREAT advantages of 'mongoose', we DON'T have to
micromanage the ORDER things happen because 'mongoose' will take care of ALL for us. */
// mongoose.connect("mongodb://localhost:27017/TodoApp");

mongoose.connect(MONGO_URI).then(
  () => {
    console.log("Connected to Mongo instance.");
  },
  err => {
    console.log("Error connecting to Mongo instance: ", err);
  }
);

//Here we're using the ES6 way to write Object where property and value are the SAME
module.export = { mongoose };
