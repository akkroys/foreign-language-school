const protectRoute = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  }
  console.log('Please log in to continue');
  res.redirect('/login');
};

const allowIf = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  return next();
};

const ensureRole = (requiredRole) => {
  return (req, res, next) => {
      if (!req.isAuthenticated()) {
          return res.redirect('/login');
      }

      if (req.user.role !== requiredRole) {
          return res.status(403).send('У вас нет доступа к этой странице.');
      }
      return next();
  };
};

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  } else {
      return res.redirect('/login');
  }
};

const addUserRole = (req, res, next) => {
  if (req.isAuthenticated()) {
      req.userRole = req.user.role;
  }
  next();
};

export { protectRoute, allowIf, ensureRole, ensureAuthenticated, addUserRole };
