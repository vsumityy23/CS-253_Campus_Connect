
// backend/seed.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Import your models
const User = require("./models/User");
const Professor = require("./models/Professor");

// --- 1. RAW DATA ---

const rawProfessors = [
  { name: "Sumit Vishwakarma", email: "sumitv@iitk.ac.in" },
  { name: "Arun Mehta", email: "arunm@iitk.ac.in" },
  { name: "Priya Sharma", email: "priyas@iitk.ac.in" },
  { name: "David Chen", email: "davidc@iitk.ac.in" },
  { name: "Sarah Johnson", email: "sarahj@iitk.ac.in" }
];

const rawStudents = [
  { email: "likhithal23@iitk.ac.in", username: "likhitha_23" },
  { email: "omsingh21@iitk.ac.in", username: "om_21" },
  { email: "preetid23@iitk.ac.in", username: "preeti_23" },
  { email: "aayusha23@iitk.ac.in", username: "aayusha_23" },
  { email: "aayushd23@iitk.ac.in", username: "aayushd_23" },
  { email: "abhirupg23@iitk.ac.in", username: "abhirup_23" },
  { email: "btirlangi23@iitk.ac.in", username: "badrinath_23" },
  { email: "adityakv23@iitk.ac.in", username: "adityak_23" },
  { email: "adityamane23@iitk.ac.in", username: "adityam_23" },
  { email: "adityapr23@iitk.ac.in", username: "adityap_23" },
  { email: "aswaaiitp23@iitk.ac.in", username: "adwaaiit_23" },
  { email: "adyansub23@iitk.ac.in", username: "adyansu_23" },
  { email: "ahermukund23@iitk.ac.in", username: "mukund_23" },
  { email: "akash23@iitk.ac.in", username: "akash_23" },
  { email: "pratyushks23@iitk.ac.in", username: "pratyush_23" },
  { email: "akshatsh23@iitk.ac.in", username: "akshatsh_23" },
  { email: "akshatsing23@iitk.ac.in", username: "akshatsi_23" },
  { email: "ssharma22@iitk.ac.in", username: "sudhanshu_22" },
  { email: "akulag23@iitk.ac.in", username: "akul_23" },
  { email: "amankumar23@iitk.ac.in", username: "amank_23" },
  { email: "amanmaloo23@iitk.ac.in", username: "amanm_23" },
  { email: "amanu23@iitk.ac.in", username: "amanu_23" },
  { email: "ameerzaman23@iitk.ac.in", username: "ameer_23" },
  { email: "ananyaki23@iitk.ac.in", username: "ananya_23" },
  { email: "anirvant23@iitk.ac.in", username: "anirvan_23" },
  { email: "spratyush23@iitk.ac.in", username: "spratyushs_23" },
  { email: "anujag23@iitk.ac.in", username: "anuj_23" },
  { email: "anupamap23@iitk.ac.in", username: "anupama_23" }
];

// --- 2. HELPER FUNCTIONS ---

// Password from NAME (for professors)
const generatePasswordFromName = (fullName) => {
  const firstName = fullName.split(" ")[0].toLowerCase();
  return firstName.charAt(0).toUpperCase() + firstName.slice(1) + "123.";
};

// Password from USERNAME (for students)
const generatePasswordFromUsername = (username) => {
  const base = username.split("_")[0];
  return base.charAt(0).toUpperCase() + base.slice(1) + "123.";
};

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB!");

    // Combine users
    const allUsers = [
      ...rawProfessors.map((p, i) => ({
        email: p.email,
        name: p.name,
        role: "Professor",
        username: `prof_${i}`
      })),
      ...rawStudents.map((s) => ({
        email: s.email,
        username: s.username,
        role: "Student"
      }))
    ];

    console.log(`⏳ Hashing passwords for ${allUsers.length} users...`);

    const usersToInsert = await Promise.all(
      allUsers.map(async (user) => {
        let plainPassword;

        if (user.role === "Professor") {
          plainPassword = generatePasswordFromName(user.name);
        } else {
          plainPassword = generatePasswordFromUsername(user.username);
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        return {
          email: user.email,
          username: user.username,
          role: user.role,
          password: hashedPassword,
          isVerified: true
        };
      })
    );

    // Clear old data
    console.log("⏳ Clearing old seed data...");
    const emails = usersToInsert.map((u) => u.email);
    await User.deleteMany({ email: { $in: emails } });
    await Professor.deleteMany({
      email: { $in: rawProfessors.map((p) => p.email) }
    });

    // Insert
    console.log("⏳ Inserting Users and Professor Whitelist...");
    await User.insertMany(usersToInsert);
    await Professor.insertMany(
      rawProfessors.map((p) => ({
        email: p.email,
        name: p.name
      }))
    );

    console.log("\n🎉 Database Seeded Successfully! 🎉\n");
    console.log("=========================================");
    console.log("🔑 SAMPLE LOGINS:");

    console.log("Professor:");
    console.log(`sumitv@iitk.ac.in  →  Sumit123.`);

    console.log("Student:");
    console.log(`omsingh21@iitk.ac.in  →  Om123.`);

    console.log("=========================================\n");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    mongoose.connection.close();
    process.exit();
  }
}

seedDatabase();

