import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
    apiVersion: "2025-12-15.clover",
    typescript: true
});

export const STRIPE_PRICES = {
    EMERGENCY: process.env.STRIPE_PRICE_EMERGENCY || "price_mock_emergency",
    FULL: process.env.STRIPE_PRICE_FULL || "price_mock_full",
    MONTHLY: process.env.STRIPE_PRICE_MONTHLY || "price_mock_monthly"
};
