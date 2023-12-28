import { app } from "./app";
require('dotenv').config();
import connectDB from './config/database';

// create server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    connectDB();
});
