import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON parsing middleware
  app.use(express.json());

  // API Routes
  app.post("/api/deposit", async (req, res) => {
    try {
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Check if Stripe key is configured
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        // Return success with mock mode if no Stripe key is configured
        // In a real scenario we'd throw an error or handle it differently
        // But for preview without API keys, we simulate success
        return res.json({
          success: true,
          simulated: true,
          message: "Stripe API Key missing. Simulating payment success.",
          amount,
        });
      }

      const stripe = new Stripe(stripeKey);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects cents
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        success: true,
      });
    } catch (error) {
      console.error("Stripe payment error:", error);
      res.status(500).json({ error: "Failed to process payment" });
    }
  });

  app.post("/api/generate-cover-letter", async (req, res) => {
    try {
      const { projectDescription, userSkills, tone } = req.body;

      if (!projectDescription) {
        return res.status(400).json({ error: "Missing project description" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const appliedTone = tone || 'Professional';

      if (!apiKey) {
        // return simulated response if no api key is configured
        const simulatedCoverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in your project. Based on the project description: "${projectDescription.substring(0, 50)}...", I believe my skillset is a perfect match. 

As a professional with expertise in ${userSkills || 'these areas'}, I have successfully delivered similar projects in the past. I am confident I can bring value to your team.

(Tone requested: ${appliedTone})

I look forward to discussing how I can contribute to your success.

Best regards,
Freelancer`;
        
        return res.json({
          success: true,
          simulated: true,
          coverLetter: simulatedCoverLetter
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert AI Bidding Assistant. Write a ${appliedTone}, concise, and tailored cover letter for a freelancer applying to the following project.
      
      Project Description:
      ${projectDescription}
      
      Freelancer Skills:
      ${userSkills || 'General web development'}
      
      Please keep it focused on the value the freelancer brings based on their skills matching the project needs. Use a ${appliedTone} tone.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      res.json({
        success: true,
        coverLetter: response.text
      });
      
    } catch(err) {
      console.error("Cover letter generation error:", err);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
