const express = require("express");

const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
} = require("../controllers/doctorController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All doctor routes are protected
router.use(protect);

// Create doctor
router.post("/", createDoctor);

// Get all doctors
router.get("/", getDoctors);

// Get all patients of a doctor
router.get("/:id/patients", getDoctorPatients);

// Get single doctor
router.get("/:id", getDoctorById);

// Update doctor
router.put("/:id", updateDoctor);

// Delete doctor
router.delete("/:id", deleteDoctor);


module.exports = router;
