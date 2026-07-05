const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (error) {
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("Error Response:", JSON.stringify(error.response, null, 2));
        }
    }
}

test();
