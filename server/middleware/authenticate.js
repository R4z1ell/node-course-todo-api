var { User } = require("./../models/user");

/* The following Route will be a PRIVATE Route that is going to require AUTHENTICATION, which means we're going 
to need to provide a VALID 'x-auth' TOKEN, it's going to find the ASSOCIATED 'user' and it's going to send that
'user' BACK. This below is going to be the MIDDLEWARE Function that we use on our ROUTES to make them PRIVATE. 
Inside a Middleware we have THREE Arguments, the 'req'(request) the 'res'(response) and 'next', the ACTUAL Route 
is NOT going to run UNTIL the 'next' gets called INSIDE of the Middleware */
var authenticate = (req, res, next) => {
  /* This 'req.header' is pretty SIMILAR to 'res.header'(which we used in the Route above), 'res.header' let us
    SET a 'header'(so it takes the KEY value, the 'x-auth' pretty much) INSTEAD 'req.header' is GETTING the value
    so we ONLY need to pass the key, so the 'x-auth' that is the VALUE we want to FETCH. Now we can go ahed and
    verify this 'token', FETCH the 'user' and do something with it. */
  var token = req.header("x-auth");

  /* The 'user' we pass in the 'then' callback MAY be 'null' if there is NO 'user' that passed the QUERY so we'll
    have to CHECK for that as well, and this check is done with the following 'if' statement */
  User.findByToken(token)
    .then(user => {
      if (!user) {
        // If there is an error(so we don't have a 'user' we will REJECT)
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      /* After we've MODIFIED the 'req' Object we need to CALL 'next' OTHERWHIRE the code below in the Callback
        of the Route will NEVER actually execute(so this code '(req, res) => { res.send(req.user);}' pretty much) */
      next();
    })
    .catch(e => {
      /* If things go wrong we're still sending back a 401 BUT we're not calling 'next' becase we DON'T want to 
        run the Callback IF the AUTHENTICATION didn't work as EXPECTED. So now that we have this in place we have
        the EXACT same functionality as before BUT with a REUSABLE Function */
      res.status(401).send();
    });
};

module.exports = { authenticate };
