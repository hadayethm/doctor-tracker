const Doctor = require("../models/Doctor");
const mongoose = require("mongoose");
const Patient = require("../models/Patient");

// Create doctor
const createDoctor = async (req, res) => {
  try {
    const { name, specialization, hospital, phone, email } = req.body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "All doctor fields are required",
      });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

// Get all doctors
const getDoctors = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      startDate,
      endDate,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(Math.max(Number(limit), 1), 100);

    const query = {};

    // Search by name, specialization or hospital
    if (search.trim()) {
      query.$text = {
        $search: search.trim(),
      };
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

    const [doctors, totalDoctors] = await Promise.all([
      Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Doctor.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDoctors / perPage);

    res.json({
      success: true,
      doctors,
      pagination: {
        currentPage,
        perPage,
        totalDoctors,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

// Get single doctor
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const {
      name,
      specialization,
      hospital,
      phone,
      email,
    } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      {
        name,
        specialization,
        hospital,
        phone,
        email,
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Delete all patients assigned to this doctor
    const deletedPatients = await Patient.deleteMany({
      doctor: id,
    });

    res.json({
      success: true,
      message: "Doctor and associated patients deleted successfully",
      deletedPatients: deletedPatients.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
};

// Get all patients of a doctor
const getDoctorPatients = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID",
      });
    }

    const doctor = await Doctor.findById(id).lean();

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const patients = await Patient.find({
      doctor: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      doctor,
      patients,
      totalPatients: patients.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctor patients",
      error: error.message,
    });
  }
};



module.exports = {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
};