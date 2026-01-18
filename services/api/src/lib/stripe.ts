import "dotenv/config";
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
console.log("Stripe Key Loaded:", key ? `Found (${key.substring(0, 8)}...)` : "MISSING", " from dotenv:", !!process.env.STRIPE_SECRET_KEY);

export const stripe = new Stripe(key || "sk_test_mock", {
    apiVersion: "2025-12-15.clover",
    typescript: true
});

export const STRIPE_PRICES = {
    EMERGENCY: process.env.STRIPE_PRICE_EMERGENCY || "price_mock_emergency",
    FULL: process.env.STRIPE_PRICE_FULL || "price_mock_full",
    MONTHLY: process.env.STRIPE_PRICE_MONTHLY || "price_mock_monthly"
};
