const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      recentPatients,
    ] = await Promise.all([
      // Total doctors
      Doctor.countDocuments(),

      // Total patients
      Patient.countDocuments(),

      // Patients per doctor
      Patient.aggregate([
        {
          $group: {
            _id: "$doctor",
            patientCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        {
          $unwind: "$doctor",
        },
        {
          $project: {
            _id: 0,
            doctorId: "$doctor._id",
            doctorName: "$doctor.name",
            specialization: "$doctor.specialization",
            patientCount: 1,
          },
        },
        {
          $sort: {
            patientCount: -1,
          },
        },
      ]),

      // Latest 5 patients
      Patient.find()
        .populate("doctor", "name specialization")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Patients created per day - last 7 days
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    sevenDaysAgo.setHours(0, 0, 0, 0);

    const patientsByDate = await Patient.aggregate([
      {
        $match: {
          createdAt: {
            $gte: sevenDaysAgo,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        patientsPerDoctor,
        patientsByDate,
        recentPatients,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};