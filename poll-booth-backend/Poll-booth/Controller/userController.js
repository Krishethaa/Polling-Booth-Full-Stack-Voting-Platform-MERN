const path=require('path');
const { promisify } = require('util');
const User = require('../Model/userModel.js'); // Adjust the path if needed
const multer  = require('multer');
const jwt = require('jsonwebtoken');


const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};



// 1. CREATE USER
exports.createUser = async (req, res) => {
    try {
        const {
            user_name,
            user_profile,
            age,
            gender,
            email,
            phone_number,
            password
        } = req.body;

        // Check for required fields
        if (!user_name || !email || !phone_number || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        const user = await User.create({
            user_name,
            user_profile,
            age,
            gender,
            email,
            phone_number,
            password
        });

        res.status(200).json({
            sucess:true,
            message: "User created successfully",
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success:false,  
            message: "Server error",
            error: err.message
        });
    }
};

// 2. GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({ message: "Users retrieved", data: users });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 3. GET USER BY ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User found", data: user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
module.exports.createImage = async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, "/Image");
    console.log("filePath", filePath);

    const UploadStorage = multer.diskStorage({
      destination: filePath,

      filename: (req, file, cb) => {
        const originalname = file.originalname; // sample.jpg
        const fileExtension = path.extname(originalname); // .jpg
        const uniqueSuffix = Date.now(); // 12332332321
        const newFileName =
          path.basename(originalname, fileExtension) +
          "_" +
          uniqueSuffix +
          fileExtension;

        cb(null, newFileName);
      },
    });

    const upload = multer({ storage: UploadStorage }).single("user_profile");

    upload(req, res, async function (err) {
      if (err) {
        return res
          .status(500)
          .json({ success: false, command: "Error Uploading file", err });
      }

      // ✅ Get the uploaded file name from req.file
      const uploadedFileName = "/api/Image/" + req.file.filename;
      req.file = uploadedFileName;
      next()
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 4. UPDATE USER
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            user_name,
            age,
            gender,
            email,
            phone_number,
            password
        } = req.body;
        const user_profile = req.user_profile
        const updateObj = {};

        // Only allow updating specific fields
        if (user_name) updateObj.user_name = user_name;
        if (user_profile) updateObj.user_profile = user_profile;
        if (age) updateObj.age = age;
        if (gender) updateObj.gender = gender;
        if (email) updateObj.email = email;
        if (phone_number) updateObj.phone_number = phone_number;
        if (password) updateObj.password = password;
        if (req.file) {
            updateObj.user_profile = req.file
            }


        const updatedUser = await User.findByIdAndUpdate(id, updateObj, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User updated", data: updatedUser });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// 5. DELETE USER BY ID
exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({ message: "User deleted", data: user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
// 4. GET USER BY PHONE NUMBER (using req.params)

exports.getUserByPhoneNumber = async (req, res) => {
    try {
        // Extract phone_number from the URL params
        const { phone_number } = req.params;

        // Find user by phone number
        const user = await User.findOne({ phone_number });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User found", data: user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};


// 6. LOGIN USER (using phone number and password)
exports.LoginUser = async (req, res) => {
    try {
        const { phone_number, password } = req.body;

        if (!phone_number || !password) {
            return res.status(400).json({ message: "Phone number and password are required" });
        }

        const user = await User.findOne({ phone_number });

        if (!user) {
            return res.status(404).json({ message: "User not found with this phone number" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // ✅ Create JWT Token
        const token = signToken(user._id);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token, // send token to frontend
            data: {
                user_id: user._id,
                user_name: user.user_name,
                phone_number: user.phone_number,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};





exports.protect = async(req,res,next)=>{
    try{
    // 1) Getting token and check of it's there
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer') ) 
  {
    token = req.headers.authorization.split(' ')[1];
  } 
  console.log(req.headers.authorization);
  if (!token) {
    return res.status(401).json({message:"You are not logged in!!! Please log in to get access"})
  }
    // 2) Verification token
 const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
 console.log(decoded);

  const currentUser = await User.findById(decoded.id);

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();

}
catch (err) 
{
    return res.status(400).json({ error: 'Something is wrong', message: err.message })
}
}
