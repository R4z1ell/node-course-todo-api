const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

/* This 'userSchema' variable is going to STORE the schema for a User, which means it's going to store ALL the
properties we have in the 'User' Model below. So inside the 'userSchema' we're going  to create a new SCHEMA, and
this 'Schema' constructor is what we NEED in order to TACKLE these CUSTOM methods, we CAN'T add methods on the 
'User' MODEL directly so we have to SWITCH on how we're GENERATING the MODEL. So the 'Schema' constructor takes
an Object and on THIS Object we define ALL the attributes for our Document and we actually already have all of
those so we can TAKE the whole datas that we were using in the previous 'User' MODEL and paste them right inside
this new 'Schema', so now we've our 'Schema' and ONLY thing we need to do to RESTORE the OLD functionality is to
pass this 'userSchema' INSIDE the 'User' MODEL like below. So at this point we've made ZERO changes to the 
functionality of our Application, we've simply RESTRUCTURED it and allowing us to ADD these METHODS */
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    /* This 'unique' property we can be set either to TRUE or FALSE verifies that the 'email' property doesn't
      have the SAME value as any other Documents in the Collection. So image that we're signign up(ci stiamo 
      registrando) for a NEW account with an email that's ALREADY in use, it WOULD pass IF we had this 'unique'
      property set to FALSE(which is the DEFAULT value) BUT when we set it to TRUE(like in our case) we WON'T be
      able to have TWO Documents with the SAME email */
    unique: true,
    validate: {
      // This 'isEmail' method of the 'validator' package returns either TRUE or FALSE
      validator: validator.isEmail, // validator.isEmail = true OR false
      message: "{VALUE} is not a valid email"
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  /* This 'tokens' property(that is an ARRAY) is a FEATURE available in MongoDB that is NOT available in SQL 
    Database like Postgres for example and like this we would be able to ACCESS the tokens for INDIVIDUAL users. 
    In order to set up the SCHEMA to support 'tokens' we're going to set it equals to an ARRAY and we're going to
    provide an OBJECT inside this Array where we're going to SPECIFY all the properties available on a token  */
  tokens: [
    {
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }
  ]
});

/* This 'toJSON' method DETERMINES what exactly gets sent BACK when a mongoose MODEL is CONVERTED into a JSON
value. */
UserSchema.methods.toJSON = function() {
  var user = this;
  /* 'user.toObject' is responsible for taking our 'user' variable and CONVERTING it into a REGULAR Object where
  ONLY the properties available on the Document exist */
  var userObject = user.toObject();

  // We're leaving OFF the 'password' and the 'tokens' Array which sould NOT get returned
  return _.pick(userObject, ["_id", "email"]);
};

/* So NOW we can ADD the methods we want on the 'Schema' like below. 'UserSchema.methods' is an OBJECT and on 
THIS Object we can add ANY methods we like, THESE are going to be our INSTANCE methods. In our case we're going
to add an instance method called 'generateAuthToken', our instance methods DO have ACCESS to the INDIVIDUAL
Document which is GREAT because we NEED that information in ORDER to create our "JSON Web Token". */
UserSchema.methods.generateAuthToken = function() {
  /* In this case we're NOT using an Arrow function because we NEED to bind the 'this' keyword and Arrow function
  do NOT let us bind it to anything, so we just use REGULAR function and we BIND the 'this' keyword to the 'user'
  variable. NOW because we've binded the 'user' to the 'this' keyword when we're going to use this
  'generateAuthToken' method INSIDE the 'server.js' file we will have ACCESS to ALL the 'user' information(like 
  the '_id' property for example) and we also DON'T need to pass ANY argument when we canll this
  'generateAuthToken' function ALSO for this exact reason, because we've access to the 'this' keyword that is
  binded to the 'user' variable so it POINTS always to the 'user' Object that get created in the 'server.js' file
  */
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, "abc123")
    .toString();

  user.tokens = user.tokens.concat({ access, token });

  /* USUALLY when we RETURN to chain in a promise we return ANOTHER promise, in THIS case though we're just
  returning a VALUE(we return the 'token' in our case) and THAT is perfectly legal. THAT value will get passed
  as the SUCCESS argument for the NEXT 'then' call */
  return user.save().then(() => {
    return token;
  });
};

/* 'statics'(a mongoose method)is an OBJECT kind of like 'methods' although everything we ADD onto it turns into
a MODEL method as opposed to an INSTANCE method. 'findByToken' is going to be a REGULAR Function(so using the
'function' keyword) because once again we NEED access to the 'this' keyword BINDING, in THIS case though we 
bind the 'this' keyword to the 'User' because INSTANCE method(like the 'generateAuthToken' we have above) gets
called with the INDIVIDUAL Document(so we bind 'user' to the 'this' keyword) instead MODEL methods gets called
with the MODEL(so the 'User') as the 'this' binding */
UserSchema.statics.findByToken = function(token) {
  var User = this;
  /* This 'decoded' variable is going to store the DECODED 'Json Web Token' VALUE but for now is set to 
  'undefined' because the 'jwt.verify()' function is going to throw an ERROR if anything goes wrong, if the 
  SECRET doesn't match the SECRET that the token was created with OR if the token value was MANIPULATED, that 
  means we want to be able to CATCH this error and do something with it. To do this we're going to use a 
  'try catch' BLOCK like below  */
  var decoded;

  /* If ANY error happen in the 'try' BLOCK the code automatically STOPS executing and moves into the 'catch'
  block, it lets us run some code there(in the 'catch') and THEN it continues on with our program */
  try {
    decoded = jwt.verify(token, "abc123");
  } catch (e) {
    return Promise.reject();
  }

  /* If we're able to SUCCESSFULLY decode the 'token' that was passed in as the HEADER we're going to call the
  'findOne' method to FIND the associated 'user' if ANY. Now this 'User.findOne' is going to return a PROMISE so
  we're going to RETURN it in order to ADD some chaining*/
  return User.findOne({
    _id: decoded._id,
    /* We need to find a 'user' WHOSE 'tokens' Array has an Object where the 'token' property EQUALS the 'token'
    property we have RIGHT here in this function('function(token)', this 'token' we take as argument pretty much).
    To query a NESTED document what we're going to do is to WRAP our value inside QUOTES(so like below where we
    have "tokens.token"). We're going to do the exact SAME thing for the 'access' property where "tokens.access"
    will be set to the "auth" STRING, so pretty much when we TRY to access a NESTED value(so when we need to
    use the DOT notation like "tokens.token" for example) we NEED to WRAP this inside QUOTES */
    "tokens.token": token,
    "tokens.access": "auth"
  });
};

/* This 'findByCredentials' function will take an 'email' and 'password' as arguments, then it will od his things
and RETURN a PROMISE with an 'user'(if things go well) OR an 'error'(if the 'user' didn't exist) */
UserSchema.statics.findByCredentials = function(email, password) {
  var User = this;

  /* Here we're trying to FIND in our Database a user where the email EQUALS the 'email' that was passed in as 
  argument inside THIS function. Now would be nice if we could do that for BOTH 'email' AND 'password' BUT we
  CAN'T because we have just the PLAIN TEXT 'password' and we DON'T have the 'password' that is ACTUALLY stored
  in the Database. In order to find a POTENTIAL match we're just going to find the user that has a MATCHING email
  with the email that we pass in this function(so pretty much we CAN'T query our Database for BOTH email and
  password and we ONLY check the email because as we've seen we can't do this for the password because we ONLY 
  have the plain text password BUT in our database we have the HASHED one stored). We're also RETURNING this
  'User.findOne' below BECAUSE in the Route inside the 'server.js' file we're CHAINING a 'then' call so we NEED
  to return a PROMISE here pretty much. In the case we DON'T have a 'user' we're going to return a REJECTED 
  Promise and this will AUTOMATICALLY trigger the 'catch' case inside our "LOGGIN" Route in the 'server.js' file
  where we respond with an ERROR */

  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject();
    }

    /* The problem we're goin to run into HERE below in our case is that the 'bcrypt' methods we're going to use
    ONLY support Callbacks Functions and NOT Promises, so because we WANT to keep using Promises we're going to
    RETURN a NEW Promise where we provide 'resolve'(if it's a success) and 'reject'(if it's NOT a success) and
    NOW inside this Promise we can do what we want, in our case we're going to use 'bcrypt.compare' to COMPARE
    the 'password' we're passing as argument in in THIS 'findByCredentials' function AND the 'user.password'
    property */
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

/* This 'pre()' is a moongose MIDDLEWARE(also called 'pre' and 'post' hooks), these Middleware are SPECIFIED on
the SCHEMA level. The 'pre' hook is going to RUN some code BEFORE a given event, and the event we WANT to run
code BEFORE is the 'save' event, so BEFORE we ever save the Document to the Database we WANT to make some changes
to it. Then we use again a REGULAR Function because we are going to need access to the 'this' keyword BINDING,
and THIS Function is going to get called with the 'next' argument that we HAVE to provide and we HAVE to call it
somewhere INSIDE the function, if we DON'T provide it and  call it the MIDDLEWARE is NEVER going to complete and
our program is going to CRASH. */
UserSchema.pre("save", function(next) {
  var user = this;

  /* NOW we can go ahead and CHECK if the password was MODIFIED. There is going to be times where we save the
  Document and we're NEVER going to have updated the password(non avremmo MAI aggiornato la password), which 
  means that the password will ALREADY be HASHED. Imagine that we saved a Document with a plain text password,
  THEN the password gets HASHED and later on we UPDATE something that's NOT the password, like the email for
  example, THIS Middleware is going to run AGAIN and that means we're going to hash our hash and the program is
  going to BREAK. SO what we're going to do is to use a METHOD called 'isModified' that takes an INDIVIDUAL
  property like 'password' and returns TRUE or FALSE, it returns TRUE if the password IS modified and returns
  FALSE if it's not, and we ONLY want to ENCRYPT the password if it was modified, which means we can WRAP the
  'user.isModified("password")' INSIDE an 'if' statement. */
  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        /* Here we're OVERRIDING the 'user.password'(so the PLAIN TEXT password) with the 'hash' in order to
        properly HIDE the plain text password */
        user.password = hash;
        // Then we CALL 'next()' which is going to complete the Middleware and it'll move on to SAVE the Document
        next();
      });
    });
  } else {
    // if that statement returns FALSE we simply moving on with the MIDDLEWARE
    next();
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = { User };
