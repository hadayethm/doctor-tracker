const express = require("express");

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// All patient routes are protected
router.use(protect);

// Create patient
router.post("/", createPatient);

// Get all patients
router.get("/", getPatients);

// Get single patient
router.get("/:id", getPatientById);

// Update patient
router.put("/:id", updatePatient);

// Delete patient
router.delete("/:id", deletePatient);

module.exports = router;