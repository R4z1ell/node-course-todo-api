/* 'SHA256' is a 'Cryptographic Hash'(it's an ALGORITHM) for a text or a data file that GENERATES a almost
unique 256-bit SIGNATURE for a text. We will NOT use the 'crypto-js' library inside of our ACTUAL application,
this was for playground purposes ONLY(l'abbiamo scaricata solo per sperimentere all'interno di questo file) 
where used the 'SHA256' function pretty much */
const { SHA256 } = require("crypto-js");
const jwt = require("jsonwebtoken");

var data = {
  id: 10
};

/* The TWO methods we're going to use from this 'jsonwebtoken' library are the 'sign' and 'verify' methods. The
'sign' method takes the OBJECT(in our case the 'data' Object where it's stored the 'id' property pretty much, so 
the user 'id') and SIGN the user, so it creates the HASH and then returns the TOKEN value. The 'verify' method
INSTEAD does the OPPOSITE, it takes that TOKEN and the SALT and it makes sure that the 'data' Object was NOT
manipulated. So the 'sign' method as we saw takes the OBJECT(the 'data' object in our case) AND the SALT(called
also secret) so the "123abc" in our case, the CALL to the 'sign' function will RETURN our TOKEN so we want to 
store it inside a 'token' variable and THIS would be the value that we'll send BACK to the User when they either
sign up OR log in, and is ALSO the value that we'll STORE inside of that 'tokens' ARRAY(the 'tokens' property
we have inside our 'user.js' file, so our User MODEL) where the 'access' property will equal to the string 'off'
and the 'token' property will EQUAL to 'token' variable we just generated HERE below */
var token = jwt.sign(data, "123abc");
/* When we run this file from the terminal we get a LONG string that stores ALL of the information we NEED to
VERIFY that the 'data' variable(where we have the 'id: 10') was NEVER manipulated. */
console.log(token);

/* By using the 'verify' function(where we pass the 'token' and the 'secret', this secret MUST be the same we
used inside the 'token' otherwise it will NOT be validated) we get the DECODED result. */ 
var decoded = jwt.verify(token, "123abc");
/* When we run this file again we will get back 'decoded { id: 10, iat: 1521178173 }', IF we try to modify 
something inside the 'decoded' variable, so for example we modify the SECRET we will get back an ERROR in the
terminal. So ONLY when the 'token' ins UNALTERATED and the SECRET is the SAME as the one we used to create the
token itself we're going to get back our DATA and this is EXACTLY what we want. ONCE we DECODE the 'data' after
the person makes the request with the 'token', we can use THAT 'id' to start actually doing the thing that the
user wants to do(like updating or creating or deleting a 'todo' and so on), so ONLY after the user it's been
VERIFIED we'll let him do what he wants to do inside our application  */
console.log("decoded", decoded);

// var message = "I am user number 3";
// /* The result of this 'SHA256' function is an Object so we're going to CONVERT it to a STRING using the
// 'toString' method. */
// var hash = SHA256(message).toString();

// /* The result of this console.log below will be a VERY long string that looks RANDOM but is NOT, this is the
// HASHED result of the 'message' variable. Hashing is a ONE way algorithm meaning that given this 'message'(the
// one we defined above) we're ALWAYS going to get this result BUT we CANNOT get the ORIGINAL 'message' back if we
// have the result. Hashing is used in a TON of different situation(for example storing passwords in a Database) and
// is a BAD idea to store PLAIN text(semplice testo) passwords in a Database, SO what a lot of people do is to SALT
// and HASH their passwords. So 'hashing' is a way to OBFUSCATE the actual plain text password, when someone goes
// to log in LATER they pass us the plain text password, we HASH it and we COMPARE the result to WHAT we have inside
// our Database, so if the TWO hashes are the IDENTICAL than the password is CORRECT and if they're NOT identical
// then the password must have NOT matched the one that is stored in the Database */
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// /* Now we're going to use HASHING in a SIMILAR way to websites like 'sourceforge' that let us VERIFY that the
// file we downloaded is the ONE that we ACTUALLY wanted because it hashes the file and show us the hash VALUE.
// This means that we can hash the file LATER and if we get the SAME result we KNOW that it's the file we WANTED,if
// we get a DIFFERENT result we know that it's NOT the file we were looking for and we shouldn't use it because it
// could have viruses INSIDE. And THIS is the EXACT technique that we'll be using for our TOKEN, with this we will
// PREVENT someone on the client who gets the value from MANIPULATING the ID and changing it to something ELSE, let's
// say that WE send back a token and THAT token says for example "I am user number 3"(like our 'message' variable
// above), the USER then gets THIS token and CHANGE it to for example "I am user number 4" and he TRY to DELETE
// someone else's DATA. What we can do is use HASHING to make sure that THAT value(the ID) doesn't actually get
// CHANGED and IF does we'll be able to SPOT that change and we'll be able to DENY the user access because we know
// that they NEVER actually got THAT token from US and they probably created the token on their own. To see how this
// is going to work let's talk about the DATA that we want to send BACK from the server to the client. */
// var data = {
//   /* This 'id' is going to be EQUAL to the user's id INSIDE of the 'user' Collection and this is going to let
//     us know WHICH user should be able to make THAT request. For example if we're trying to DELETE a 'todo' with
//     an 'id' of 3 BUT the user who CREATED that 'todo' doesn't MATCH with the 'id' of the TOKEN then we know that
//     the user SHOULDN'T be able to delete that because it's NOT their data. So THIS 'data' variable is WHAT we
//     want to send back to the CLIENT, now the IMPORTANT piece of the puzzle is going to MAKE SURE that the client
//     doesn't set 4 to 5 for example, then send the token back to us saying "hey go ahead and DELETE all the todos
//     for the user number 5" because that would be a REALLY BIG security FLAW */
//   id: 4
// };

// /* So INSTEAD what we're going to do is to create a SEPARATE variable called 'token' and THIS is what we're going
// to send BACK to the user. This 'token' Object is going to contain a 'data' property that we set equal to the
// 'data' Object we just defined above(we use the ES6 definition as usual) and THEN we're going to go ahead and
// set a 'hash' property that is going to be the hash VALUE of the 'data', so if the 'data' CHANGE later on and we
// REHASH it we're NOT going to get the SAME value back so we'll be able to tell that the 'data' was MANIPULATED by
// the CLIENT and we should NOT expect it to be VALID. */
// var token = {
//   data,
//   /* the 'data' variable is an OBJECT so we FIRST convert it to a JSON STRING and THEN to a normal String. With
//   THIS in place we now have a token that is NOT still secure because for example the User can change our 'id'
//   property inside the 'data' Object from 4 to 5, ALL they have to do is REHASH that 'data', added onto the 'hash'
//   property and send the token BACK and they technically would TRICK US. What we're going to do to PREVENT this
//   problem is to SALT the hash, SALTING the hash means we add something on the hash that is UNIQUE and that will
//   CHANGE the final VALUE of the hash itself. In our case here below we've added this "somesecret" salt that will
//   salt our hash, NOW the user is NOT going to be able to manipulate THIS data ANYMORE, they COULD change the 'id'
//   from 4 to 5 BUT they're NOT going to have the SALT so their hash is going to be BAD and when we THEN try to
//   VERIFY this hash we're going to see that the data and hash don't are the SAME because the person who manipulated
//   it DIDN'T have the SALT and we'll be able to DENY him the ACCESS for that request. */
//   hash: SHA256(JSON.stringify(data) + "somesecret").toString()
// };

// /* So let's now say that the User might TRY to CHANGE this 'token.data.id' property to the number 5, and it will
// ALSO create the hash(so 'token.hash'). Now this is WHERE the SALT comes into play, the User on the Client trying
// to MANIPULATE the 'data' Object they DO NOT have access to the SAME salt("somesecret" in our case), the DON'T
// know that SALT because that salt is ONLY on the SERVER, which means that when they try to REHASH and update the
// 'token.hash' property to a NEW value this it's NOT going to MATCH the hash that WE created previously and we'll
// be able to tell that the 'data' was CHANGED, so now if we run this file inside the terminal with the following
// code 'node .\playground\hashing.js' we will get the 'Data was changed. Do not trust!' message printed on the
// screen. So NOW we've a way to make sure that the 'data' variable was NEVER changed and in our case this is going
// to be the TOKEN we pass BACK and FORTH. Now THIS concept, so the idea of having an Object, hashing it and
// verifying it LATER, this is NOT something new but it's actually a WHOLE standard that it's called "JSON Web Token"
// and THIS is exactly what we'll be implementing INSIDE our application */
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// /* Let's now see how we would VALIDATE the 'token' variable to see if it was NOT manipulated. The 'resultHash'
// variable will STORE the hash of the data that comes back, so the 'data' that MAY or may NOT have been manipulated.
// So we pass inside the 'SHA256' function the ACTUAL 'data'(that is 'token.data' pretty much) and we'll ALSO use the
// exact SAME salt so "somesecret", THEN we go ahead and call the 'toString' method so that we can get back our
// STRING value so that we can make some COMPARISONS(below here with the 'if' statement) */
// var resultHash = SHA256(JSON.stringify(token.data) + "somesecret").toString();

// /* IF 'resultHash === token.hash' we KNOW that the data was NOT manipulated because if it was the hash would NOT
// equal the hash provided because of the SALT */
// if (resultHash === token.hash) {
//   console.log("Data was not changed");
// } else {
//   console.log("Data was changed. Do not trust!");
// }
