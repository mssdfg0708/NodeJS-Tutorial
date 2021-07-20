const targetDir = '../Data';
const fs = require('fs');

fs.readdir(targetDir, (error, fileList) => {
    fileList.forEach(file => {
        console.log(file);
    });
})