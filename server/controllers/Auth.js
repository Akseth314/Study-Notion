const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
// const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const {passwordUpdated} = require("../mail/templates/passwordUpdate")
require("dotenv").config();

// sendOTP 
exports.sendotp = async (req,res) => {
    
    try{
         // fetch email from req ki body
        const {email} = req.body;

        // check if user already exit
        const checkUserPresent = await User.findOne({email});

        // if user already exit return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            });
        }

        // generate otp
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ",otp);

        // make sure otp is unique
        // check unique otp or not
        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        // create this otp in database
        const otpPayload = {email,otp};

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response
        res.status(200).json({
            success:true,
            message:'OTP Send Successfully',
            otp,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
         
    }
   
    
}
// signUp
exports.signup = async (req,res) => {
    try{
          //data fetch from request ki body
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    } = req.body;
    
    // validate krlo
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }

    // 2 password ko match karlo
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password and confirmPassword value does not match,please try again',
        });
    }

    // check user already exist or not
    const existingUser = await User .findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User is already registered",
        });
    }

    // fid the most recent OTP stored for the user
     const recentOtp = await OTP.find({email}).sort({created:-1}).limit(1);
     console.log(recentOtp);

    // validate OTP
    if(recentOtp.length == 0){
        // OTP not found
        return res.status(400).json({
            success:false,
            message:'OTP not found',
        });
    }else if(otp !== recentOtp[0].otp){
        // invalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password,10);

    // entry create in DB

    const ProfileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,
    });
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails: ProfileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
     // return response
     return res.status(200).json({
        success:true,
        message:'User is registered Successfully',
        user,
     })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered please try again',
        })
    }

}
//  Login
exports.login = async (req,res) => {
    try{
        // get data from reqki body
        const {email,password} = req.body;
        // vaidation body
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are reqiured, please try again',
            })
        }
        // user check exist or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first",
            })
        }
        // generate JWT,after password matching
        if(await bcrypt.compare(password,user.password)){
            // generate token
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password = undefined;


            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                // user,
                user,
                // : {
                //     ...user.toObject(), // Convert Mongoose object to plain object
                //     token, // Include token in the user object
                // },
                message: "User logged in successfully",
            });
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            });
        }
    
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login failure, please try again',
        });
    }
}



// changePassword
// exports.changePassword = async (req,res) => {

//     try{

//     }catch(error){

//     }
//     // get data from req body
//     // get oldPassword ,newPassword, confirmNewPassword
//     // validation

//     // update pwd in DB

//     // send mail- Password updated
//     // return response
// }


// changePassword
// exports.changePassword = async (req, res) => {
//     try {
//         // get data from req body
//         const { oldPassword, newPassword, confirmNewPassword } = req.body;

//         // validation
//         if (!oldPassword || !newPassword || !confirmNewPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required",
//             });
//         }

//         // check if newPassword matches confirmNewPassword
//         if (newPassword !== confirmNewPassword) {
//             return res.status(400).json({
//                 success: false,
//                 message: "New password and confirm new password do not match",
//             });
//         }

//         // find user by id
//         const userId = req.user.id; // assuming you're using JWT authentication
//         const user = await User.findById(userId);

//         // check if oldPassword matches the current password
//         const isMatch = await bcrypt.compare(oldPassword, user.password);
//         if (!isMatch) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Old password is incorrect",
//             });
//         }

//         // Hash the new password
//         const hashedNewPassword = await bcrypt.hash(newPassword, 10);

//         // update password in DB
//         await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

//         // send mail - Password updated (you can implement this part separately)

//         // return response
//         return res.status(200).json({
//             success: true,
//             message: "Password updated successfully",
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Failed to update password, please try again",
//         });
//     }
// }


// changePassword
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};
