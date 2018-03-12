const mongoose = require("mongoose");

/* The NEXT thing that we need to do is to create a MODEL, NOW we know that INSIDE of 'mongodb' our COLLECTION 
can store ANYTHING, we could have a Collection with a Document that has an 'age' property and that is, we can
have DIFFERENT Documents in the SAME Collection with a 'name' property and that is. These TWO documents are
DIFFERENT but they're in the SAME Collection, 'mongoose' on the other hand likes to KEEP things a little more
ORGANIZED. So what we're going to do is to CREATE a MODEL for everything we want to store, in our case we're
going to create a "Todo" MODEL that is going to have certain attributes, it's going to have a 'text' attribute
that we know it's a STRING, it's going to have a 'completed' attribute that will be a BOOLEAN, so THESE are the
things we can DEFINE. What we're going to do is to CREATE this 'moongose Model' SO that 'moongose' KNOWS how to
STORE our DATA. The 'model()' METHOD takes TWO arguments, the FIRST one is the STRING name of the model(and that
is 'Todo') and the SECOND argument is going to be an OBJECT that is going to DEFINE the various properties for
our MODEL. With this in place we now have a WORKING 'mongoose' Model  */
var Todo = mongoose.model("Todo", {
  text: {
    type: String,
    required: true,
    minlength: 1,
    trim: true // will TRIM(tagliare) ANY white space in the beginning OR end of our value
  },
  completed: {
    type: Boolean,
    default: false
  },
  // This 'completeAt' will let us know WHEN a 'Todo' was COMPLETED
  completedAt: {
    type: Number,
    default: null
  }
});

/* This below is HOW we can create NEW INSTANCES(so brand new 'Todo', and as we can see we can name them like we
want) with the help of the 'Todo' Constructor Function we just defined here above. Now this 'Todo' Constructor
Function TAKE an Argument that is going to be an OBJECT where we can SPECIFY some of these properties, for 
example maybe we know that want the 'text' property to be equal to something like 'Cook dinner' SO right here
inside this Object we CAN specify that(notice that we HAVEN'T even required ANY of the other attributes, but we
just used the 'text' property and THIS is completely FINE) */
// var newTodo = new Todo({
//   text: "Cook dinner"
// });

/* Let's NOW see how we can SAVE this newly created INSTANCE to the DATABASE. Creating a NEW instance ALONE does
not ACTUALLY update the 'MongoDB' Database, SO what we NEED to do is to CALL a method on the 'newTodo' variable
we defined above. The method we're going to need is the 'save()' method that is going to be RESPONSIBLE for
actually SAVING the 'newTodo' to the 'MongoDB' Database, this 'save' method returns a PROMISE which means that 
we can CHAIN the 'then' method and ADD a few Callbacks for when the data get either SAVED or when an ERROR 
occurs because for example the connection fails or maybe the MODEL is NOT valid. And with ALL of this we're now
DONE, we have a CONFIGURED 'mongoose' connection to the 'MongoDB' Database, we've CREATED a MODEL specifying the
attributes we want to have for our 'Todo', we CREATED a new INSTANCE of 'Todo' an FINALLY we saved it to the
Database. Now we can RUN this 'file' in our terminal with the following code 'node .\server\server.js' and we
get "Saved todo { text: 'Cook dinner', _id: 5aa5e6ed3c842929501cd62e, __v: 0 }" meaning that things went WELL.
So we have on '_id' property with an 'ObjectID'(that long number) as we EXPECTED and the 'text' property with a
value EXACTLY equal to WHAT we specified and the '__v' property that comes from 'mongoose' and essentially keeps
TRACK of the various MODEL changes OVER TIME */
// newTodo.save().then(
//   doc => {
//     console.log("Saved todo", doc);
//   },
//   e => {
//     console.log("Unable to save todo");
//   }
// );

module.exports = { Todo };
