const Category = require("../models/Category");

// create handler of Tag

exports.createCategory = async (req,res) =>{
    try{
        // fetch data
        const {name,description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        } 
        // create entry  in db
        const CategoryDetails = await Category.create({
            name:name,
            description:description,
        });
        console.log(CategoryDetails);
        // return response

        return res.status(200).json({
            success:true,
            message:'Category created successfully',
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

// get all tags

exports. showAllCategories = async (req,res) => {
    try{
        const  allCategory = await Category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All tags returned successfully",
            allCategory,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}

// categoryPageDetails
exports.categoryPageDetails = async (eq,res) => {
    try{
        // get categoryId
        const {categoryId} = req.body;
        // get coursed for specified categoryId
        const selectedCategory = await Category.findById(categoryId)
                                        .populate("courses")
                                        .exec();
        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'Data not found',
            });
        }
        // get course for different categories
        const differentCategories = await Category.find({
                                    _id: {$ne:categoryId},      //ne means not equal
                                    })
                                    .populate("courses")
                                    .exec();
        // get top selling courses
        const allCategories = await Category.find().populate("courses");
        const allCourses = allCategories.flatMap((category) => category.courses);
        const mostSellingCourses = allCourses
             .sort((a,b) => b.sold - a.sold)
             .slice(0,10);                      

        // return response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}