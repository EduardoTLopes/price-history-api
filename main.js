const fs = require('fs');
var path = require('path');
const express = require('express');
const app = express();
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: "./APIKey.json"
});

// Performs label detection on the image file

client
    .textDetection('./italian_receipt.jpeg')
    .then(results => {
        // fs.appendFile(path.join(__dirname, 'output.txt'), `\n${JSON.stringify(results, null, 2)}`, err => {
        //     if (err) {
        //         console.error('file error:', err);
        //     }
        //     console.log('parsed content written to output.txt')
        // });
        const content = results[0].textAnnotations[0].description
        fs.appendFile(path.join(__dirname, 'output.txt'), `\n${content}`, err => {
            if (err) {
                console.error('file error:', err);
            }
            console.log('parsed content written to output.txt')
        });

    })
    .catch(err => {
        console.error('ERROR:', err);
    }
    );

app.listen(5000, '127.0.0.1', () => console.log('Server running on port 5000'));
