const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, 
    totalOrders: { type: Number, required: true, default: 0 },
    totalProcessed: { type: Number, required: true, default: 0 },
    totalCancelled: { type: Number, required: true, default: 0 },
    totalRevenue: { type: Number, required: true, default: 0 },
    cancelledPayments:{type:Number,required:true,default:0}
  },
  { timestamps: true } 
);

const Analytics = mongoose.model("Analytics", AnalyticsSchema);

module.exports = Analytics;
