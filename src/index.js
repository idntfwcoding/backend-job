import "./config/env.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at port : ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("MongoDb connection failed !!! ", err);
    });

// Move the export out here so Vercel can find it immediately
export default app;