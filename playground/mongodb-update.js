const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  // This is the REFERENCE to the Database that we need to use because we're on the latest version of 'mongodb'
  const db = client.db("TodoApp");

  /* This 'findOneAndUpdate' method(that let us UPDATE a document of our choice) takes FOUR arguments, the FIRST
  one is the 'filter' Object, in here we specify the document that we're looking for, in our case we're gonna
  SEARCH for a particular document with an '_id' property set to "5aa5b70323ab2aae7d74efa7". The SECOND argument
  is the UPDATE object, so where we ACTUALLY write the code to CHANGE our document, in here we use the 'Update
  Operator' that will let us make this update(without it will NOT work), as the THIRD argument we have the 
  'options' Object that has several settings(6 to be precise) BUT we're going to use just one of those, the 
  'returnOriginal' that when set to FALSE will return the UPDATED Object, the LAST argument is the Callback
  Function BUT we're not going to use it because if we don't we get back a PROMISE from this 'findOneAndUpdate'
  method that is what we want so that we can CHAIN the 'then' method and do SOMETHING with the result of the
  Promise, in our case we print the 'result' document(so the document we just updated) on the terminal */
//   db.collection("Todos").findOneAndUpdate({
//       _id: new ObjectID("5aa5b70323ab2aae7d74efa7")
//   }, {
//     /* This '$set' is an 'Update Operator' of MongoDB(so not 'mongodb' DRIVER for Node.js BUT the ACTUAL 
//     MongoDB Database) and will let us UPDATE a specific FIELD in our document, we NEED to use this 'Update
//     Operator' otherwhise it will NOT work */
//     $set: {
//         completed: true
//     }
//   }, {
//       // With this 'returnOriginal' property set to FALSE we will RETURN the Updated Object in the terminal
//       returnOriginal: false
//   }).then((result) => {
//       console.log(result);
//   });

  // CHALLENGE
  db.collection("Users").findOneAndUpdate({
      /* In this case the '_id' property of this document was CHANGED by us previously, so in this case we 
      DON'T have the '_id' property with the VALUE that gets AUTOMATICALLY set by MongoDB(so that usual long
      number) and so we DON'T need to use the 'new ObjectID' code but we just add the number 123 that in our 
      case is the '_id' value that WE set previously for this document */ 
      _id: 123
  }, {
      $set: {
        name: "R4z1ell"
      }, 
      $inc: { 
        age: 1 
      } 
  }, {
      returnOriginal: false  
  }).then(result => {
    console.log(result);
  });

  // client.close();
});