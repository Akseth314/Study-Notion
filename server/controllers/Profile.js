const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const Course = require("../models/Course")


// updateProfile handler

exports.updateProfile = async (req,res) => {
    try{
            // get data
            const {dateOfBirth="", about="", contactNumber,gender} = req.body;
            // get userId
            const id = req.user.id;
            // validate
            if(!contactNumber || !gender || !id){
                return res.status(400).json({
                    success:false,
                    message:'All fields are required',
                });
            }
            // find profile
            // we dont have profileId but we have UserId and in this profile present as additionalDetails
            const userDetails = await User.findById(id);
            const profileId = userDetails.additionalDetails;
            const profileDetails = await Profile.findById(profileId); 

            // update profile
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about = about;
            profileDetails.contactNumber = contactNumber;
            profileDetails.gender = gender;
            // db mai save karo
            await profileDetails.save(); 

            // return response
            return res.status(200).json({
                success:true,
                message:'Profile Updated Successfully',
                profileDetails,
            });
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message, 
        })
    }
}

// delete account

exports.deleteAccount = async (req,res) => {
    try{
        // get id
        const id = req.user.id;
        // validate
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:'User not found',
            }); 
        }
        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // todo-> unenroll user from all enrolled courses
        // delete user
        await User.findByIdAndDelete({_id:id});

        // return response
        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
        });
    }
}

// get all details of user

exports.getAllUserDetails = async (req,res) => {
    try{
        // get id
        const id = req.user.id;
        // validate and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        // return response
        return res.status(200).json({
            success:true,
            message:'User Data fetched successfully',
            data: userDetails,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: "Image Updated successfully",
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.instructorDashboard = async (req, res) => {
  try {
    const courseDetails = await Course.find({ instructor: req.user.id })

    const courseData = courseDetails.map((course) => {
      const totalStudentsEnrolled = course.studentsEnroled.length
      const totalAmountGenerated = totalStudentsEnrolled * course.price

      // Create a new object with the additional fields
      const courseDataWithStats = {
        _id: course._id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        // Include other course properties as needed
        totalStudentsEnrolled,
        totalAmountGenerated,
      }

      return courseDataWithStats
    })

    res.status(200).json({ courses: courseData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server Error" })
  }
}