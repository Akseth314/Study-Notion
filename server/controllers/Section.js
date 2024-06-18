const Section = require("../models/Section");
const Course = require("../models/Course");


// create section handlre function
exports.createSection = async (req,res) => {
    try{
        // fetch data
        const {sectionName,courseId} = req.body;

        // data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        // create section
        const newSection = await Section.create({sectionName});
       

        // update course with section objectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                            courseId,
                                            {
                                                $push:{
                                                    courseContent:newSection._id,
                                                }
                                            },
                                            {new:true}
                                        ).populate({
                                            path: "courseContent",
                                            populate: {
                                                path: "subSection",
                                            },
                                        })
                                        .exec();
                                                                        
        // Todo -> use populate to replace section/subsections both in updatedCourseDetails

        // response return
        return res.status(200).json({
            success:true,
            message:'Section Created Successfully',
            updatedCourseDetails,
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to create Section, please try again',
            error:error.message, 
        });
    }
}

// update section handler function
exports.updateSection = async (req,res) => {
    try{
        // data fetch
        const {sectionName, sectionId} = req.body;

        // data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        // update data
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});

        // return res
        return res.status(200).json({
            success:true,
            message:'Section updated Successfully',
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to update Section, please try again',
            error:error.message, 
        });
    }
}


// delete section handler function

exports.deleteSection = async (req,res) => {
    try{
        // get sectionId
        const {sectionId} = req.body;

        // use function findbyIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        // todo -> do we need to delete the entry from the course schema ???
        // return response
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:'Unable to delete Section, please try again',
            error:error.message, 
        });
    }
}