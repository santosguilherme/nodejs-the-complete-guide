const path = require("path");
const fs = require("fs");

module.exports = {
    clearImage: filePath => {
        const newFilePath = path.join(__dirname, '..', filePath);

        fs.unlink(newFilePath, error => {
            if (error) {
                throw error;
            }
        });
    }
};
