const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");

/* The 'remove' method kind of work like the 'find' method, so we pass a QUERY and ALL the items MATCHING the
query get REMOVED, if NONE matches none will get removed. Now the DIFFERENCE between 'find' and 'remove' is that
we CAN'T pass to 'remove' an EMPTY argument and expect to have ALL the Documents removed, if we WANT to remove
EVERYTHING from our Collection we need to run the following code below, so NOW if we run THIS file from the 
terminal we'll ALL our documents REMOVED, so we run this code 'node .\playground\mongoose-remove.js' in the 
terminal and we get back this result '{ n: 3, ok: 1 }', so we have 'ok: 1' meaning ALL was fine and then 'n: 3'
so the NUMBER of Documents that were REMOVED(in this case 3 Documents) */
// Todo.remove({}).then(result => {
//   console.log(result);
// });

/*'findOneAndRemove' works kind of like 'findOne', it's going to FIND that FIRST document that MATCH the QUERY
and REMOVE it, this will ALSO return the Document so that we can do something with this returning Data(the
Document WILL get removed but we'll ALSO get the Document OBJECT back so that we can print it to the terminal or
we can send it back to the user). This is UNLIKE the 'remove' method where we DON'T get the Document Object back,
there we just got a number saying HOW many Documents were removed, so with the 'findOneAndRemove' we ALSO get
that information back(so the ACTUAL Document Object of the Document removed). Another method very similar is the
'findByIdAndRemove' method that find a Document based on the ID we pass in the query, this method ALSO return
back to the user an OBJECT. */
Todo.findOneAndRemove({ _id: "5aa862ddcc92e3a1235159a5" }).then(todo => {
  console.log(todo);
});

Todo.findByIdAndRemove("5aa862ddcc92e3a1235159a5").then(todo => {
  console.log(todo);
});
