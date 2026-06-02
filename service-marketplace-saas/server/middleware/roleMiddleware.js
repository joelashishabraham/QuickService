// middleware/roleMiddleware.js

const roleMiddleware = (allowedRoles = []) => {

  return (req, res, next) => {

    try {

      /* ================= CHECK USER ================= */

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated"
        });
      }

      /* ================= ROLE CHECK ================= */

      if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied: insufficient permissions"
        });
      }

      next();

    } catch (error) {

      console.error("Role middleware error:", error);

      return res.status(500).json({
        success: false,
        message: "Authorization error"
      });

    }

  };

};

module.exports = roleMiddleware;