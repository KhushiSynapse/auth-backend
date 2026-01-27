const mongoose = require("mongoose");

const PlanSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    features: { type: [String], default: [] },
    frequency: { type: String, enum: ["DAY","WEEK","MONTH","YEAR"], default: "MONTH" },
    billingCycle: { type: Number, default: 1 } 

}, { timestamps: true }); 

const Plan = mongoose.model("Plan", PlanSchema);

module.exports = Plan;
