// server.js
import express from "express";
import cors from "cors";
import Stripe from "stripe";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------
// STRIPE CHECKOUT ENDPOINT
// -----------------------------
app.post("/api/checkout", async (req, res) => {
  try {
    const { mode, lineItems, successUrl, cancelUrl, discounts } = req.body;

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "No items to checkout" });
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: lineItems,
      discounts,
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("STRIPE ERROR:", error);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// -----------------------------
// EMAIL ENDPOINT
// -----------------------------
app.post("/api/send-email", async (req, res) => {
  try {
    const { subject, message, name, phone, address, notes } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"MailRun Website" <${process.env.EMAIL_USERNAME}>`,
      to: "info@mailrun-orlando.com",
      subject,
      text: `
Name: ${name}
Phone: ${phone}
Address: ${address}
Notes: ${notes}

${message}
`
    });

    res.json({ success: true });

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    res.status(500).json({ error: "Email failed" });
  }
});

// -----------------------------
// ROOT TEST ROUTE
// -----------------------------
app.get("/", (req, res) => {
  res.send("MailRun Backend is running! ✔️");
});

// -----------------------------
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
