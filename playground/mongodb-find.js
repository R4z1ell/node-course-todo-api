const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if (err) {
    return console.log("Unable to connect to MongoDB server");
  }
  console.log("Connected to MongoDB server");
  // This is the REFERENCE to the Database that we need to use because we're on the latest version of 'mongodb'
  const db = client.db("TodoApp");

  /* 'find()' is a METHOD available on 'collection', by DEFAULT we can call this 'find' method WITHOUT an
  argument, this means that we're NOT providing a QUERY saying that we want to fetch all "todos" that are 
  completed or not completed BUT we're just saying that want to fetch ALL our "todos", so EVERY document inside
  the 'Todos' collection. Calling the 'find' method is ONLY the first step for fetching data, 'find' returns
  a 'MongoDB Cursor' that is NOT the actual document itself BUT is a POINTER to those documents. This CURSOR
  has a TON of methods and we can use them to GET our documents, one of the MOST common 'Cursor Method' that we
  are going to be using is the 'toArray' method. With this method INSTEAD of having a CURSOR we have an ARRAY
  of documents, this means we've an Array of OBJECTS with '_id', 'text' and 'completed' properties. So THIS
  'toArray' method GETS us EXACTLY what we want BACK, so our documents. The 'toArray' method RETURNS a PROMISE,
  this means we can CHAIN a 'then()' method and ADD a Callback so that when things go RIGHT we can do something
  like printing those documents on the terminal, if things DON'T go right we print an error message and the
  ACTUAL error. So NOW with all of this in place we have a script that is CAPABLE of fetching our documents,
  CONVERTING them into an ARRAY(thanks to the 'toArray' method) and printing them to the terminal. NOW we want
  to fetch ONLY the "todos" with a 'completed' value of FALSE(we're refering to the 'completed' property inside
  our documents,and we ONLY want the one with a FALSE value) and for doing this we NEED to pass a QUERY inside
  the 'find' method and we write '{ completed: false }' inside the 'find' method. So ALL we have to do to QUERY
  by VALUE is to SET UP the key-value pairs right inside the 'find' method, now if we RERUN our script inside
  the terminal we will ONLY see the documents with a 'completed' value of FALSE */
//   db.collection("Todos").find({ completed: false }).toArray().then((docs) => {
//     console.log("Todos");
//     console.log(JSON.stringify(docs, undefined, 2));
//   }, (err) => {
//     console.log("Unable to fetch todos", err);
//   });

  /* Let's now see how we can FETCH our documents based on their '_id', in THIS case in the 'find' method we
  can pass '{_id: "5aa43a4af3b6222850fd9f6b"}' BUT this will NOT work because what we have inside the '_id' 
  property is NOT a string but it's an 'ObjectID'(the VALUE of the '_id' property we know that is NOT a string
  but is an ObjectID) which means we NEED to use the 'ObjectID' CONSTRUCTOR Function that we IMPORTED previously
  in order to CREATE an ObjectID for the QUERY, so INSTEAD of using the VALUE of the '_id' property we use pass
  the 'new ObjectID()' constructor function, as we know the 'ObjectID' takes ONE argument that in this case
  will be the VALUE of the '_id' property(so the "5aa43a4af3b6222850fd9f6b" pretty much that we've stored as
  a STRING). So now THIS is going to WORK as expected */
//   db.collection("Todos").find({ 
//       _id: new ObjectID("5aa43a4af3b6222850fd9f6b") 
//     }).toArray().then((docs) => {
//     console.log("Todos");
//     console.log(JSON.stringify(docs, undefined, 2));
//   }, (err) => {
//     console.log("Unable to fetch todos", err);
//   });

  /* In this case we're using the 'count' method that we'll return the NUMBER of "todos" that are inside our
  'Todos' collection, in our case if we rerun the script we get printend on the terminal "Todos count: 2" 
  because of course we ONLY have 2 documents. So 'count' and 'toArray' are just FEW of ALL the other METHODS
  that we've available on the CURSOR(that is WHAT the 'find' method give us BACK) */
//   db.collection("Todos").find().count().then((count) => {
//     console.log(`Todos count: ${count}`);
//   }, (err) => {
//     console.log("Unable to fetch todos", err);
//   });

  /* In this example we're trying to fetch ALL the documents in the 'Users' collection that have a 'name' 
  property EQUAL to 'R4z1ell' and then print those documents to the terminal, in our case we just have TWO
  documents as we can see from the terminal if we RUN the script */
  db.collection("Users").find({ name: "R4z1ell"}).toArray().then((docs) => {
    console.log("Users");
    console.log(JSON.stringify(docs, undefined, 2));
  }, (err) => {
    console.log("Unable to fetch Users", err);
  });

  // client.close();
});
