
require('dotenv').config();

console.log("Loaded Keys:");
Object.keys(process.env).forEach(key => {
    if (key.includes("GEMINI") || key.includes("API")) {
        console.log(`${key}: ${process.env[key] ? "Present" : "Missing"}`);
    }
});
