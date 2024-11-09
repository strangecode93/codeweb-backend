var express = require('express');
var router = express.Router();
var userModel = require("../models/user.model.js");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var projectModel = require("../models/project.model.js");

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

const secret = process.env.JWT_SECRET; // Make sure to use a strong secret and store it securely

/* Signup Route */
router.post("/signup", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists!" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await userModel.create({
      name,
      username,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ success: true, message: "User created successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/* Login Route */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Compare provided password with the hashed password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials!" });
    }

    // Generate JWT token
    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, secret, { expiresIn: '1h' });

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token: token,
      userId: existingUser._id
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/getUserDetails", async (req, res) => {
  let {userId} = req.body;
  let user = await userModel.findOne({_id: userId});
  if(user) {
    return res.status(200).json({success: true, user: user});
  } else {
    return res.status(404).json({success: false, message: "User not found!"});
  }
})

router.post("/createProject", async (req, res) => {
  let {title, userId} = req.body;
  let user = await userModel.findOne({_id: userId});
  if(user){
    let project = await projectModel.create({title: title, createdBy: userId});
    return res.status(200).json({success: true, message: "Project created successfully!", projectId: project._id});
  } else {
    return res.status(404).json({success: false, message: "User not found!"});
  }
})

router.post("/getProjects", async (req, res) => {
  let {userId} = req.body;
  let user = await userModel.findOne({_id: userId});
  if(user){
    let projects = await projectModel.find({createdBy: userId});
    return res.status(200).json({success: true,message: "Projects fetched successfully!", projects: projects});
  } else {
    return res.status(404).json({success: false, message: "User not found!"});
  }
})

router.post("/deleteProject", async (req, res) => {
  let {userId, projectId} = req.body;
  let user = await userModel.findOne({_id: userId});
  if(user){
    let project = await projectModel.findOneAndDelete({_id: projectId});
    if(project){
      return res.status(200).json({success: true, message: "Project deleted successfully!"});
    } else {
      return res.status(404).json({success: false, message: "Project not found!"});
    }
  } else {
    return res.status(404).json({success: false, message: "User not found!"});
  }
})

router.post("/getProject", async (req, res) => {
  const { userId, projectId, title } = req.body; // Extract userId and projectId from request body

  try {
    // Check if the user exists
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // Find the project for the user
    const project = await projectModel.findOne({ _id: projectId });
    if (!project) {
      console.error(`Project with ID ${projectId} not found for user ${userId}.`);
      return res.status(404).json({ success: false, message: "Project not found!" });
    }

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully!",
      project: project, // Return the project data
    });
  } catch (error) {
    console.error("Error fetching project:", error); // Log the error
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});



router.post("/updateProject", async (req, res) => {
  let {userId, projectId, htmlCode, cssCode, jsCode} = req.body;
  let user = await userModel.findOne({_id: userId});
  if(user){
    let project = await projectModel.findOneAndUpdate({_id: projectId}, {htmlCode: htmlCode, cssCode: cssCode, jsCode: jsCode}, {new: true});
  
  if(project){
    return res.status(200).json({success: true, message: "Project updated successfully!"});
  } else {
    return res.status(404).json({success: false, message: "Project not found!"});
  }
  } else {
    return res.status(404).json({success: false, message: "User not found!"});
  }
})


module.exports = router;
