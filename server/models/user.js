const mongoose = require("mongoose");
const validator = require("validator");

var User = mongoose.model("User", {
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

module.exports = { User };
