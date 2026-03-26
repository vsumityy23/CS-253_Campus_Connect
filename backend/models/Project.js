const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dept: { type: String, required: true },
  program: { type: String, required: true },
  cpi: { type: Number, required: true }, // Min CPI
  duration: { type: String, required: true },
  teamSize: { type: String, required: true },
  skills: { type: String, required: true },
  description: { type: String, required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Open", "Closed"], default: "Open" }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);