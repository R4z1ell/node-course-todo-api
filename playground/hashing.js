const {SHA256} = require("crypto-js");

var message = "I am user number 3";
/* The result of this 'SHA256' function is an Object so we're going to CONVERT it to a STRING using the 
'toString' method. */
var hash = SHA256(message).toString();

/* The result of this console.log below will be a VERY long string that looks RANDOM but is NOT, this is the 
HASHED result of the 'message' variable. Hashing is a ONE way algorithm meaning that given this 'message'(the 
one we defined above) we're ALWAYS going to get this result BUT we CANNOT get the ORIGINAL 'message' back if we
have the result. Hashing is used in a TON of different situation(for example storing passwords in a Database) and
is a BAD idea to store PLAIN text(semplice testo) passwords in a Database, SO what a lot of people do is to SALT
and HASH their passwords. So 'hashing' is a way to OBFUSCATE the actual plain text password, when someone goes
to log in LATER they pass us the plain text password, we HASH it and we COMPARE the result to WHAT we have inside
our Database, so if the TWO hashes are the IDENTICAL than the password is CORRECT and if they're NOT identical
then the password must have NOT matched the one that is stored in the Database */
console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);