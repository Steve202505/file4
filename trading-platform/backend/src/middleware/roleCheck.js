const isAgent = (req, res, next) => {
  if (req.userType !== 'agent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Agent privileges required.'
    });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.userType !== 'agent' || req.agent.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  // Check for special admin username if needed
  if (process.env.ADMIN_USERNAME && req.agent.username !== process.env.ADMIN_USERNAME) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }

  next();
};

const checkPermission = (permission) => {
  return (req, res, next) => {
    // Admins have all permissions
    if (req.agent && req.agent.role === 'admin') {
      return next();
    }

    if (req.agent && req.agent.permissions.includes(permission)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Insufficient permissions. Required: ${permission}`
    });
  };
};

module.exports = {
  isAgent,
  isAdmin,
  checkPermission
};