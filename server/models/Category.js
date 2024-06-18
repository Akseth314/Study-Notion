const mongoose = require("mongoose");

// Define the Tags Schema
const categorySchema = new mongoose.Schema({
    name: {
        type:String,
        required: true,
    },
    description: {
        type:String,
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
    ],
});

// export the tags model
module.exports = mongoose.model("Category",categorySchema);