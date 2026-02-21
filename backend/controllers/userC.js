const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const appointmentSchema = require("../schemas/appointmentModel");

/// ✅ Registering the user
const registerController = async (req, res) => {
  try {
    const { fullName, email, password, phone, type } = req.body;

    if (!fullName || !email || !password || !phone || !type) {
      return res.status(400).send({
        success: false,
        message: "All fields (fullName, email, password, phone, type) are required",
      });
    }

    const existsUser = await userSchema.findOne({ email });
    if (existsUser) {
      return res.status(200).send({
        message: "User already exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userSchema({
      fullName,
      email,
      password: hashedPassword,
      phone,
      type,
    });

    await newUser.save();

    return res.status(201).send({
      success: true,
      message: "Register Success",
    });
  } catch (error) {
    console.log("Register error:", error);
    return res.status(500).send({
      success: false,
      message: `Error: ${error.message}`,
    });
  }
};

/// ✅ Login controller
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    user.password = undefined;

    return res.status(200).send({
      message: "Login successful",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: `${error.message}` });
  }
};

/// ✅ Auth controller
const authController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Auth error", success: false, error });
  }
};

/// ✅ Doctor registration
const docController = async (req, res) => {
  try {
    const { doctor, userId } = req.body;

    const newDoctor = new docSchema({
      ...doctor,
      userId: userId.toString(),
      status: "pending",
    });
    await newDoctor.save();

    const adminUser = await userSchema.findOne({ type: "admin" });
    if (!adminUser) {
      return res.status(404).send({
        success: false,
        message: "Admin user not found",
      });
    }

    adminUser.notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.fullName} has applied for doctor registration`,
      data: {
        userId: newDoctor._id,
        fullName: newDoctor.fullName,
        onClickPath: "/admin/doctors",
      },
    });

    await adminUser.save();

    return res.status(201).send({
      success: true,
      message: "Doctor registration request sent successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({
      success: false,
      message: "Error while applying",
      error: error.message,
    });
  }
};

/// ✅ Get all notifications
const getallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.seennotification.push(...user.notification);
    user.notification = [];
    const updatedUser = await user.save();

    return res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Unable to fetch", success: false, error });
  }
};

/// ✅ Delete all notifications
const deleteallnotificationController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    user.notification = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Notifications deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Unable to delete", success: false, error });
  }
};

/// ✅ Get all approved doctors
const getAllDoctorsControllers = async (req, res) => {
  try {
    const docUsers = await docSchema.find({ status: "approved" });
    return res.status(200).send({
      message: "Doctor list",
      success: true,
      data: docUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong", success: false, error });
  }
};

/// ✅ Book appointment
const appointmentController = async (req, res) => {
  try {
    let { userInfo, doctorInfo } = req.body;
    userInfo = JSON.parse(userInfo);
    doctorInfo = JSON.parse(doctorInfo);

    let documentData = null;
    if (req.file) {
      documentData = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
    }

    const newAppointment = new appointmentSchema({
      userId: req.body.userId,
      doctorId: req.body.doctorId,
      userInfo,
      doctorInfo,
      date: req.body.date,
      document: documentData,
      status: "pending",
    });

    await newAppointment.save();

    const user = await userSchema.findOne({ _id: doctorInfo.userId });
    if (user) {
      user.notification.push({
        type: "New Appointment",
        message: `New Appointment request from ${userInfo.fullName}`,
      });

      await user.save();
    }

    return res.status(200).send({
      message: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong", success: false, error });
  }
};

/// ✅ Get all appointments for a user
const getAllUserAppointments = async (req, res) => {
  try {
    const allAppointments = await appointmentSchema.find({
      userId: req.body.userId,
    });

    const doctorIds = allAppointments.map((appointment) => appointment.doctorId);
    const doctors = await docSchema.find({ _id: { $in: doctorIds } });

    const appointmentsWithDoctor = allAppointments.map((appointment) => {
      const doctor = doctors.find(
        (doc) => doc._id.toString() === appointment.doctorId.toString()
      );
      const docName = doctor ? doctor.fullName : "";
      return {
        ...appointment.toObject(),
        docName,
      };
    });

    return res.status(200).send({
      message: "Appointments listed",
      success: true,
      data: appointmentsWithDoctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong", success: false, error });
  }
};

/// ✅ Get documents for a user
const getDocsController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const allDocs = user.documents;
    if (!allDocs || allDocs.length === 0) {
      return res.status(200).send({
        message: "No documents found",
        success: true,
        data: [],
      });
    }

    return res.status(200).send({
      message: "Documents listed",
      success: true,
      data: allDocs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong", success: false, error });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  docController,
  getallnotificationController,
  deleteallnotificationController,
  getAllDoctorsControllers,
  appointmentController,
  getAllUserAppointments,
  getDocsController,
};