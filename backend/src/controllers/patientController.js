const mongoose = require("mongoose");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Create patient
const createPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      email,
      condition,
      address,
      doctor,
    } = req.body;

    if (
      !name ||
      age === undefined ||
      !gender ||
      !phone ||
      !condition ||
      !doctor
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, age, gender, phone, condition and doctor are required",
      });
    }

    // Check doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    // Check doctor exists
    const existingDoctor = await Doctor.findById(doctor);

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      email,
      condition,
      address,
      doctor,
    });

    const populatedPatient = await Patient.findById(patient._id)
      .populate("doctor", "name specialization hospital")
      .lean();

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient: populatedPatient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create patient",
      error: error.message,
    });
  }
};

// Get all patients
const getPatients = async (req, res) => {
  try {
    const {
      search = "",
      condition = "",
      doctor = "",
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const query = {};

    // Search by patient name, condition or phone
    if (search.trim()) {
      query.$text = {
        $search: search.trim(),
      };
    }

    // Condition filter
    if (condition.trim()) {
      query.condition = {
        $regex: condition.trim(),
        $options: "i",
      };
    }

    // Doctor filter
    if (doctor) {
      if (!mongoose.Types.ObjectId.isValid(doctor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID",
        });
      }

      query.doctor = doctor;
    }

    // Date filter
    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte = new Date(
          `${startDate}T00:00:00.000Z`
        );
      }

      if (endDate) {
        query.createdAt.$lte = new Date(
          `${endDate}T23:59:59.999Z`
        );
      }
    }

    const skip = (currentPage - 1) * perPage;

    const [patients, totalPatients] = await Promise.all([
      Patient.find(query)
        .populate("doctor", "name specialization hospital")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Patient.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalPatients / perPage);

    res.json({
      success: true,
      patients,
      pagination: {
        currentPage,
        perPage,
        totalPatients,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

// Get single patient
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id)
      .populate("doctor", "name specialization hospital phone email")
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient",
      error: error.message,
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const {
      name,
      age,
      gender,
      phone,
      email,
      condition,
      address,
      doctor,
    } = req.body;

    if (doctor) {
      if (!mongoose.Types.ObjectId.isValid(doctor)) {
        return res.status(400).json({
          success: false,
          message: "Invalid doctor ID",
        });
      }

      const existingDoctor = await Doctor.findById(doctor);

      if (!existingDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      id,
      {
        name,
        age,
        gender,
        phone,
        email,
        condition,
        address,
        doctor,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("doctor", "name specialization hospital")
      .lean();

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update patient",
      error: error.message,
    });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete patient",
      error: error.message,
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};