const { ObjectID } = require("mongodb");

const { mongoose } = require("./../server/db/mongoose");
const { Todo } = require("./../server/models/todo");
const { User } = require("./../server/models/user");

var id = "5aa707d5a98a8d1d4c3e366e";

/* This 'isValid' is a method of the 'ObjectID' MODULE of 'mongodb' NATIVE driver that will VERIFY if the 'id'
we just passed in is VALID or NOT, if it's valid it will return TRUE and if it's not will return FALSE. So in
our case when we pass an INVALID 'id' string the 'isValid' method will return FALSE, then with the '!' operator
we FLIP this value to true so the WHOLE statement becomes 'if (true) { .... }' and SO we print the message to
the terminal. If the 'id' we pass is VALID then the 'if' statement will NOT pass so nothing will be printend on
the termial */
if (!ObjectID.isValid(id)) {
  console.log("ID not valid");
}

/* The 'find' method of Mongoose let us QUERY as many "todos" as we want, we can pass NO argument the get ALL 
the "todos" OR we can specify other things, in THIS case we're going to QUERY by ID */
Todo.find({
  /* In THIS case we're passing to the '_id' property the STRING 'id'(the one we just specified ABOVE) that
    will be taken by MONGOOSE and CONVERTED to an 'ObjectID' and THEN it's going to run the QUERY. So we DON'T
    need to MANUALLY convert our string into an 'ObjectID' because MONGOOSE takes care of it automatically for
    us */
  _id: id
})
  /* In THIS case the result of this console.log would be an ARRAY which contains the ONE Document with THAT
specific ID, so we would have an ARRAY with inside it a SINGLE Object(our document) */
  .then(todos => {
    console.log("Todos", todos);
  });

/* The 'findOne' method is SIMILAR to 'find', the ONLY difference is that it returns ONE document at most, this
means that it simply grabs the FIRST document that MATCHES the query we defined and in our case we're querying
by a UNIQUE id so it's ONLY going to find ONE matching document BUT if there were OTHER documents, for example
queried ALL "todos" with the "completed" property set to FALSE, ONLY the FIRST of these documents will be 
returned by this 'findOne' method EVEN though we had MORE documents that matched the query */
Todo.findOne({
  _id: id
})
  /* In this case it's ONLY gonna find ONE document, so we have 'todo' and NOT an ARRAY of documents like above
with the 'find' method where we have 'todos' */
  .then(todo => {
    /* With the 'findOne' method we get back the ACTUAL document(so an Object) and NOT an ARRAY(which contains 
    the Object Document) like with the 'find' method above. SO if we're trying to fetch ONLY a single document
    it's BETTER to use the 'findOne' method OVER the 'find' method because we get back an OBJECT as opposed to
    an ARRAY and this ALSO makes it EASIER when the ID of the document we're looking for DOESN'T exist because
    instead of getting an EMPTY Array as result we will get 'null' back and we CAN work with this value and do
    whatever we like, that means that we can maybe return a 404 or maybe we want to do something else if the ID
    is NOT found */
    console.log("Todo", todo);
  });

/* The LAST method we're going to see is the 'findById' method that is FANTASTIC if we're just looking for a 
Document by its IDENTIFIER because with this method we can ONLY query by ID and NOTHING else. So ALL we need to
do is to pass the ID as the ARGUMENT for the 'findById' method like below, we DON'T have to query an OBJECT with
inside the '_id: id' like we did for both the 'find' and 'findOne' methods */
Todo.findById(id)
  .then(todo => {
    if (!todo) {
      /* IF the 'id' is WRONG(so if for some reason it's NOT equal to any id we have in the database,so if there
    is NO Document with that specific id, so if we have NO 'todo') this function will return the 'null' value 
    and in THAT specific case we want to print this "ID not found" message inside the terminal */
      return console.log("Id not found");
    }
    /* As result we get back our Document OBJECT just like the one we got back from the 'findOne' method. SO if we
  want to find a Document just using his ID it's better if we use this 'findById' method INSTEAD if we want to
  find a Document by ANYTHING else other than the ID it's better to use the 'findOne' method */
    console.log("Todo by Id", todo);
  })
  .catch(e => console.log(e));

// CHALLENGE
User.findById("5aa694bc34b9d80fb44d0256").then(
  user => {
    if (!user) {
      return console.log("Unable to find user");
    }
    console.log(JSON.stringify(user, undefined, 2));
  },
  e => console.log(e)
);
