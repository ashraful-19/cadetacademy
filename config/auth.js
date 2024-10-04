const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    req.session.returnTo = req.originalUrl;
    console.log(req.session.returnTo)
    res.redirect("/auth/login");
  };
  
  const checkLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      const returnTo = req.session.returnTo || '/';
        res.redirect(returnTo);
      // return res.redirect("/");
    }
    next();
  };
  


  module.exports = { checkAuthenticated, checkLoggedIn };
  