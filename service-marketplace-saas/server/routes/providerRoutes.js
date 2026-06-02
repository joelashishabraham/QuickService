const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

const providerController = require("../controllers/providerController");


/* ================= PUBLIC ROUTES ================= */

/* Get all providers */

router.get("/", providerController.getAllProviders);

/* Get single provider */

router.get("/id/:id", providerController.getProviderById);


/* ================= PROVIDER ROUTES ================= */

/* Get logged-in provider profile */

router.get(
"/profile",
auth,
role(["provider"]),
providerController.getMyProfile
);


/* Update provider profile */

router.put(
"/profile",
auth,
role(["provider"]),
providerController.updateProfile
);


/* Get provider services */

router.get(
"/my-services",
auth,
role(["provider"]),
providerController.getMyServices
);


/* Provider dashboard stats */

router.get(
"/dashboard",
auth,
role(["provider"]),
providerController.getDashboardStats
);


module.exports = router;