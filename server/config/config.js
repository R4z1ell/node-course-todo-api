/* We're going to have THREE environments in total, we already have a 'production' environment that is what we
have when we run our app on Heroku, we're going to have a 'development' environment when we run our app LOCALLY
and we'll have a 'test' environment when we run our app through MOCHA, this means that we'll be able to set up a
DIFFERENT value for the 'MONGO_URI' variable for all three of those environment. This 'env' variable is currently 
set ONLY on HEROKU, we DON'T have this 'env' variable set LOCALLY. Now the 'NODE_ENV' variable is something that
we NEED to configure inside our 'package.json' file for our 'development' and 'test' environments, THEN using 
an 'if' statement we'll be able to configure our app depending on the environment. So if we're on 'development'
we'll use one database, if we're on 'test' we'll use a DIFFERENT one, so now inside 'package.json' we're going 
to tweak the 'test' script setting the 'NODE_ENV' environment variable. Now we can set 'environment variable' 
by CHAINING together MULTIPLE commands, so the GOAL here is to SET the 'NODE_ENV' equal to test BEFORE we run 
the test suite(so the part starting with 'mocha') and in order to do that we're going to use the 'export' 
COMMAND(that works on Linux and OSx) and the 'SET' command that works on Windows. So now with this in place 
we've a way to set the 'NODE_ENV' variable right inside the 'package.json' file */
var env = process.env.NODE_ENV || "development";

// var db = {
//   dev: "mongodb://localhost:27017/TodoApp",
//   test: "mongodb://localhost:27017/TodoAppTest",
//   mlab: "mongodb://R4z1ell:123@ds111319.mlab.com:11319/node-todo-api"
// };

if (process.env.PORT) {
  process.env.MONGODB_URI = "mongodb://R4z1ell:123@ds111319.mlab.com:11319/node-todo-api";
}

if (env === "development" || env === "test") {
  /* When we require a JSON file it gets AUTOMATICALLY parsed into a JavaScript Object, so we DON'T have to use
  anything like 'JSON.parse' to get that done */
  var config = require("./config.json");
  var envConfig = config[env];

  /* 'Object.keys' take an OBJECT(like our 'envConfig'), gets ALL the 'keys'(so ALL the properties NAMES of the
  Object pretty much) of this Object and RETURNS them as an ARRAY, so in this case 'Object.keys(envConfig)' will 
  return '["PORT", "MONGODB_URI"]'. Now we can LOOP over this ARRAY(so we can loop over EACH item of this ARRAY) 
  with the 'forEach' method like below, it takes a Callback Function as his one and ONLY argument and THAT 
  Callback Function gets called for EACH item in the Array. We call the items in this Array 'key', which means
  that we're going to have a Function that gets called with a 'key' of 'PORT' and a 'key' of 'MONGODB_URI' pretty
  much */
  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
}

// if (process.env.PORT) {
//   process.env.MONGODB_URI = db.mlab;
// } else {
//   process.env.PORT = 3000;
//   if (env === "development") {
//     process.env.MONGODB_URI = db.dev;
//   } else if (env === "test") {
//     /* So NOW when we run our application in 'test' mode we're going to use a completely DIFFERENT Database(so this
//     'TodoAppTest', this is the name of the new Database) and we're NOT going to wipe the Database that we're using
//     for 'development' */
//     process.env.MONGODB_URI = db.test;
//   }
// }
