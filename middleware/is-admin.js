const isAdmin = (req, res, next) => {
  if (!req.session.user) return res.redirect('/auth/sign-in');
  if (req.session.user.role === 'Admin') return next();
  res.send('Only an Admin can do this.');
};

module.exports = isAdmin;
