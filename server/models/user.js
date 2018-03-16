const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

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
  variable. */
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

var User = mongoose.model("User", UserSchema);

module.exports = { User };
