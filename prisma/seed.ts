import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Raw list provided by user (will be trimmed and de-duplicated below)
const providedCityNames = [
  "Agra",
  "Ajmer",
  "Aligarh",
  "Alwar",
  "Amritsar",
  "Assam",
  "Bandikui",
  "Banswara",
  "Bareli",
  "Barmer",
  "Beawar",
  "Behror",
  "Bhadra",
  "Bharatpur",
  "Bhilwara",
  "Bihar",
  "Bikaner",
  "Bundi",
  "Chittorgarh",
  "Churu",
  "Dausa",
  "Deedwana",
  "Delhi",
  "Dholpur",
  "Dungargarh",
  "Durgapur",
  "Etawah",
  "Fatehpur",
  "Firozabad",
  "Ganganagar",
  "Gangapur",
  "Gurugram",
  "Hanumangarh",
  "Haryana",
  "Hathras",
  "Hindaun",
  "Hisar",
  "Jaipur",
  "Jammu",
  "Jhalawar",
  "Jhunjhunu",
  "Jodhpur",
  "Kanpur",
  "Karauli",
  "Kekdi",
  "Khatushyam",
  "Kishangarh",
  "Kota",
  "Kotputali",
  "Kuchaman",
  "Lalsoth",
  "Madhya Pradesh",
  "Makrana",
  "Malpura",
  "Mathura",
  "Merta",
  "Mumbai",
  "Nagaur",
  "Narnaul",
  "Neem ka Thana",
  "Niwai",
  "Nohar",
  "Pali",
  "Paota",
  "Parbatsar",
  "Phulera",
  "Pilani",
  "Rajsamandh",
  "Ratangarh",
  "Rawatsar",
  "Rewari",
  "Sambhar Lake",
  "Sardarsahar",
  "Sawai Madhopur",
  "Shahpura",
  "Shree Madhopur",
  "Shri Ganganagar",
  "Shri Madhopur",
  "Sikar ",
  "Sojat",
  "Sujangarh",
  "Todabhim",
  "Tonk",
  "Uttar Pradesh",
  "Udaipur",
  "West Bengal",
  "Chennai",
  "Bhopal",
  "Sirsa",
  "Mahendragarh",
  "Barmer",
  "Chomu",
];

// Surgery types list
const providedSurgeryTypes = [
  "Total Knee Replacement",
  "Total Hip Replacement",
  "Revision Knee Surgery",
  "Revision Hip Surgery",
  "Tuksplasty (Partial Knee)",
  "Trauma",
  "Bipolar",
  "Arthoplasty",
  "Conservative",
];

async function main() {
  console.log("Wiping and seeding Cities...");

  // Normalize names: trim whitespace and remove empty strings, then de-duplicate
  const normalized = providedCityNames
    .map((n) => (n ?? "").trim())
    .filter((n) => n.length > 0);
  const uniqueNames = Array.from(new Set(normalized));

  // Remove all existing cities
  // Delete dependents first to satisfy relations
  const delAppointments = await prisma.appointment.deleteMany({});
  const delDays = await prisma.day.deleteMany({});
  const delClosedDays = await prisma.closedDay.deleteMany({});
  const delRes = await prisma.cities.deleteMany({});
  console.log(
    `Deleted: appointments=${delAppointments.count}, days=${delDays.count}, closedDays=${delClosedDays.count}, cities=${delRes.count}`
  );

  // Insert new list
  const data = uniqueNames.map((name) => ({ name }));

  // createMany is efficient; fallback to per-item upsert if needed
  try {
    const createRes = await prisma.cities.createMany({ data });
    console.log(`Inserted ${createRes.count} cities`);
  } catch (err) {
    console.warn(
      "createMany failed, falling back to sequential inserts...",
      err
    );
    for (const { name } of data) {
      await prisma.cities.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log(`Inserted ${data.length} cities (sequential)`);
  }

  // Now seed surgery types
  console.log("Seeding Surgery Types...");

  // Normalize surgery type names
  const normalizedSurgeryTypes = providedSurgeryTypes
    .map((n) => (n ?? "").trim())
    .filter((n) => n.length > 0);
  const uniqueSurgeryTypes = Array.from(new Set(normalizedSurgeryTypes));

  // Remove all existing surgery types
  const delSurgeryTypes = await prisma.surgeryTypes.deleteMany({});
  console.log(`Deleted: surgeryTypes=${delSurgeryTypes.count}`);

  // Insert new surgery types
  const surgeryData = uniqueSurgeryTypes.map((name) => ({ name }));

  try {
    const createSurgeryRes = await prisma.surgeryTypes.createMany({
      data: surgeryData,
    });
    console.log(`Inserted ${createSurgeryRes.count} surgery types`);
  } catch (err) {
    console.warn(
      "createMany failed for surgery types, falling back to sequential inserts...",
      err
    );
    for (const { name } of surgeryData) {
      await prisma.surgeryTypes.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
    console.log(`Inserted ${surgeryData.length} surgery types (sequential)`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
