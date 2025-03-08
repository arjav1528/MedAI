const express = require('express');

const app = express();




app.get('/', (req, res) => {
    res.send('Hello MedAI');
});





app.listen(3000, () => {
    console.log('Server is running on localhost:3000');
});