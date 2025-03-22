const app = require("./src/app");
const connectDB = require("./src/db/connectDB");
const dotenv = require('dotenv')
dotenv.config();



connectDB().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000 ✔✔');
        console.log('http://localhost:3000');
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB ✘✘.. Error:', err);
    process.exit(1);
}
);