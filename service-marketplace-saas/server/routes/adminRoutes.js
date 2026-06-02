const express = require("express");
const router = express.Router();

/* ================= MIDDLEWARE ================= */

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

/* ================= CONTROLLER ================= */

const adminController = require("../controllers/adminController");

/* ================= SAFETY WRAPPER ================= */

const safe = (fn) => {
  return async (req, res, next) => {
    try {
      if (typeof fn !== "function") {
        return res.status(500).json({
          success: false,
          message: "Admin controller function not implemented"
        });
      }

      await fn(req, res, next);

    } catch (error) {

      console.error("Admin route error:", error);

      res.status(500).json({
        success: false,
        message: "Server error"
      });

    }
  };
};


/* =======================================================
   ADMIN DASHBOARD
======================================================= */

router.get(
  "/stats",
  auth,
  role(["admin"]),
  safe(adminController.getAdminStats)
);


/* =======================================================
   USER MANAGEMENT
======================================================= */

/* GET ALL USERS */

router.get(
  "/users",
  auth,
  role(["admin"]),
  safe(adminController.getAllUsers)
);


/* DELETE USER */

router.delete(
  "/users/:id",
  auth,
  role(["admin"]),
  safe(adminController.deleteUser)
);


/* BLOCK / UNBLOCK USER */

router.put(
  "/users/block/:id",
  auth,
  role(["admin"]),
  safe(adminController.toggleBlockUser)
);


/* =======================================================
   SERVICES / ADS CONTROL
======================================================= */

/* GET ALL SERVICES */

router.get(
  "/services",
  auth,
  role(["admin"]),
  safe(adminController.getAllServices)
);


/* DELETE SERVICE */

router.delete(
  "/services/:id",
  auth,
  role(["admin"]),
  safe(adminController.deleteService)
);


/* FEATURE / UNFEATURE SERVICE */

router.put(
  "/feature/:id",
  auth,
  role(["admin"]),
  safe(adminController.toggleFeatureService)
);


/* =======================================================
   BOOKINGS MANAGEMENT
======================================================= */

router.get(
  "/bookings",
  auth,
  role(["admin"]),
  safe(adminController.getAllBookings)
);


/* =======================================================
   REPORT MANAGEMENT
======================================================= */

/* GET REPORTS */

router.get(
  "/reports",
  auth,
  role(["admin"]),
  safe(adminController.getAllReports)
);


/* RESOLVE REPORT */

router.put(
  "/reports/:id",
  auth,
  role(["admin"]),
  safe(adminController.resolveReport)
);


/* DELETE REPORT */

router.delete(
  "/reports/:id",
  auth,
  role(["admin"]),
  safe(adminController.deleteReport)
);


/* =======================================================
   FEATURE MANAGEMENT (SITE FEATURES)
======================================================= */

router.get(
  "/features",
  auth,
  role(["admin"]),
  safe(adminController.getFeatures)
);


router.post(
  "/features",
  auth,
  role(["admin"]),
  safe(adminController.addFeature)
);


router.delete(
  "/features/:id",
  auth,
  role(["admin"]),
  safe(adminController.deleteFeature)
);


router.put(
  "/features/toggle/:id",
  auth,
  role(["admin"]),
  safe(adminController.toggleFeature)
);


/* =======================================================
   EXPORT ROUTER
======================================================= */

module.exports = router;