const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    htmlCode: {
        type: String,
        default: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>Project</h1>
        </body>
        </html>`
    },
    cssCode: {
        type: String,
        default: "body { background-color: #f4f4f4; }"
    },
    jsCode: {
        type: String,
        default: "// some comment"
    }
});

module.exports = mongoose.model("Project", projectSchema);