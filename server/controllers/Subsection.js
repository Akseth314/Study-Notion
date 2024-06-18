const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { populate } = require("../models/User");
const { query } = require("express");

exports.createSubSection = async (req,res) => {
   try{
        // fetch data from req ki body
        const {sectionId, title, timeDuration, description} = req.body;
        // fetch file/video 
        const video = req.files.video;
        // validate
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        // uplaod video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

        // create a subsection
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });
        // update section with this subsection
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                               {$push:{
                                                subSection:subSectionDetails._id,
                                               }},
                                               {new:true}
                                              ).populate('subSection');
        // todo -> log updated section here, after adding populate query
        console.log('Updated Section:', updatedSection);

        // return response
        return res.status(200).json({
            success:true,
            message:'Sub Section created Successfully',
            updatedSection,
        }); 
   }catch(error){
        return res.status(500).json({
            success:false,
            message:'Internal Server Error',
            error:error.message,
        })
   }

}

// todo -> update subSection

exports.updateSubSection = async (req, res) => {
    try {
        const { subSectionId, title, timeDuration, description } = req.body;

        // Validate inputs
        if (!subSectionId || !title || !timeDuration || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Find the subsection by ID and update its fields
        const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId, {
            title: title,
            timeDuration: timeDuration,
            description: description,
        }, { new: true });

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: 'Subsection not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subsection updated successfully',
            updatedSubSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}


// todo -> delete subSection

exports.deleteSubSection = async (req, res) => {
    try {
        const { subSectionId } = req.body;

        // Validate input
        if (!subSectionId) {
            return res.status(400).json({
                success: false,
                message: 'Subsection ID is required',
            });
        }

        // Delete the subsection by ID
        const deletedSubSection = await SubSection.findByIdAndDelete(subSectionId);

        if (!deletedSubSection) {
            return res.status(404).json({
                success: false,
                message: 'Subsection not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Subsection deleted successfully',
            deletedSubSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        });
    }
}
