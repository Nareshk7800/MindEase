require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    console.log("=== GEMINI API DIAGNOSTICS ===");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ ERROR: GEMINI_API_KEY is missing from .env");
        return;
    }

    console.log(`🔑 API Key Found: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    const genAI = new GoogleGenerativeAI(apiKey);

    // Test different models to see which one works
    const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

    for (const modelName of modelsToTest) {
        console.log(`\n🤖 Testing Model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS! Response: "${text}"`);
            console.log(`🎉 Model '${modelName}' is WORKING!`);
            return; // Exit on first success
        } catch (error) {
            console.error(`❌ FAILED for ${modelName}`);
            // Log full error details
            if (error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Status Text: ${error.response.statusText}`);
                // Try to parse error body often hidden in 'error.response'
                try {
                    // Sometimes the library hides the raw body inside error properties
                    console.error("   Error Details:", JSON.stringify(error, null, 2));
                } catch (e) { }
            } else {
                console.error("   Error Message:", error.message);
            }
        }
    }

    console.log("\n=== DIAGNOSTIC SUMMARY ===");
    console.log("❌ All tested models failed. This usually means:");
    console.log("1. The API Key is potentially invalid or disabled.");
    console.log("2. The project linked to this API Key doesn't have the Generative Language API enabled.");
    console.log("3. You are in a region (like EU/UK) where API access might be restricted without billing.");
}

testGemini();
