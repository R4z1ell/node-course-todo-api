const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  // This is the REFERENCE to the Database that we need to use because we're on the latest version of 'mongodb'
  const db = client.db("TodoApp");

  /* This script will DELETE ALL the "todos" with a TEXT value of "Eat lunch". NOW if we run the following 
  command from the terminal(node .\playground\mongodb-delete.js) we will see a LONG list of code BUT the ONLY 
  important piece for us is actually at the very TOP and it's the following('result: { n: 3, ok: 1 }'), in here
  we can see ok: 1' which means things did go as EXPECTED and then we've 'n: 3' and this is the NUMBER of records
  that were DELETED(so we had 3 documents with a text value of 'Eat lunch' and ALL of them got deleted as we 
  wanted), so THIS is how we can target and delete MANY "todos" */
//   db.collection("Todos").deleteMany({ text: "Eat lunch" }).then((result) => {
//     console.log(result);
//   });

  /* Another method that let us delete things is the 'deleteOne' method that ONLY delete the FIRST item that
  MATCHES the criteria and then STOPS. Now if we run the same 'node .\playground\mongodb-delete.js' command from
  the terminal we get AGAIN a long list of code and always at the top of this list there is the IMPORTANT piece
  for us that is the following 'result: { n: 1, ok: 1 }'. So NOW we've JUST delete ONE document with the text
  value of 'Eat lunch' EVEN though we ADDED two of them(we added two documents with the SAME 'text' property 
  value with 'Robomongo') */
//   db.collection("Todos").deleteOne({ text: "Eat lunch" }).then((result) => {
//     console.log(result);
//   });

  /* Here we're using YET again another method that let us DELETE stuff, in this case we're using the
  'findOneAndDelete' method that will find the document where the 'completed' property has a value of 'false'
  and delete ONLY the FIRST one that he finds(so EVEN if we have MULTIPLE documents with the SAME property value
  this method will just DELETE the first one he finds). NOW this 'findOneAndDelete' method unlike the OTHER two
  methods we used above(so 'deleteMany' and 'deleteOne') DON'T return that LONG list of code where we had at the
  top the 'result' OBJECT with the 'n' and 'ok' property but INSTEAD it actually return us the document itself,
  so this means we can chain the 'then' method and print this document to the terminal. This time we get a few
  DIFFERENT things from our 'result' Object we just printed in the terminal, we DO get an 'ok: 1' property that
  letting us know that ALL went well, we have a 'value' property where his value is the ACTUAL document we just
  deleted and THIS is why the 'findOneAndDelete' method is so useful(it gets us that document BACK as well as
  DELETING it) and we get the last property called 'lastErrorObjct' with a value of 'n: 1' so the NUMBER of
  document that GOT delete, in our case JUST one */
//   db.collection("Todos").findOneAndDelete({ completed: false }).then((result) => {
//     console.log(result);
//   });

  // CHALLENGE
//   db.collection("Users").deleteMany({ name: "R4z1ell" }).then((result) => {
//      console.log(result);
//   });

  db.collection("Users").findOneAndDelete({ _id: new ObjectID("5aa43be80f1b790c8c47290d") }).then((result) => {
    console.log(JSON.stringify(result, undefined, 2));
  });

  // client.close();
});