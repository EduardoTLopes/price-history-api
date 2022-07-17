const express = require('express');
const app = express();
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
    keyFilename: "./APIKey.json"
});

// Performs label detection on the image file

client
    .textDetection('./example-receipt.jpeg')
    .then(results => {
        results[0].textAnnotations.forEach(text => console.log(text.description));
    })
    .catch(err => {
        console.error('ERROR:', err);
    }
    );

app.listen(5000, '127.0.0.1', () => console.log('Server running on port 5000'));
