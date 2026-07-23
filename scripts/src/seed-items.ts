import path from "node:path";
import { eq } from "drizzle-orm";

try {
  process.loadEnvFile(path.resolve(import.meta.dirname, "..", "..", ".env.local"));
} catch {
  // Hosted environments may provide DATABASE_URL directly.
}

const { db, pool, itemsTable, usersTable } = await import("@workspace/db");

const DEMO_USER_ID = "seed_campus_demo";
const DEMO_EMAIL = "demo@campusfound.local";

const sampleItems = [
  { title: "Black Herschel Backpack", description: "Black canvas backpack with a small university pin on the front pocket.", type: "lost", category: "Bags", location: "Academic Complex", dateLostFound: "2026-07-20", imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Silver iPhone 14", description: "Silver phone in a clear case, lock screen has a blue abstract wallpaper.", type: "found", category: "Electronics", location: "Information Resource Centre", dateLostFound: "2026-07-21", imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Sony Wireless Headphones", description: "Black over-ear headphones found beside the seating area.", type: "found", category: "Electronics", location: "Chancellor Complex Plaza", dateLostFound: "2026-07-18", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Brown Leather Wallet", description: "Slim brown wallet containing several membership cards. No cash disclosed.", type: "lost", category: "Wallets", location: "Village 5 Student Centre", dateLostFound: "2026-07-17", imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Blue Hydro Flask", description: "Deep blue insulated bottle with two small travel stickers.", type: "found", category: "Bottles", location: "Sports Complex", dateLostFound: "2026-07-22", imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Casio Scientific Calculator", description: "Dark grey Casio calculator with the owner's initials lightly written on the back.", type: "lost", category: "Study Equipment", location: "Lecture Hall 2", dateLostFound: "2026-07-16", imageUrl: "https://images.unsplash.com/photo-1574607383476-f517f260d30b?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Round Gold Glasses", description: "Thin gold-tone prescription glasses in a dark green case.", type: "found", category: "Accessories", location: "Main Hall", dateLostFound: "2026-07-20", imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80", status: "claimed" },
  { title: "White Compact Umbrella", description: "White folding umbrella with a wooden handle and fabric sleeve.", type: "lost", category: "Accessories", location: "Main Entrance", dateLostFound: "2026-07-19", imageUrl: "https://images.unsplash.com/photo-1558151507-c1aa3d917e8b?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "MacBook USB-C Charger", description: "White USB-C power adapter and two-metre charging cable.", type: "found", category: "Electronics", location: "Teaching and Research Laboratories", dateLostFound: "2026-07-15", imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Red Student Lanyard", description: "Red lanyard with a clear card holder. Student details are hidden for privacy.", type: "found", category: "IDs and Cards", location: "Chancellor Hall", dateLostFound: "2026-07-23", imageUrl: "https://images.unsplash.com/photo-1579389083078-4e7018379f7e?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Grey Nike Running Shoes", description: "Pair of grey running shoes in a reusable sports bag.", type: "lost", category: "Clothing", location: "Gymnasium", dateLostFound: "2026-07-14", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Green Spiral Notebook", description: "A5 green notebook containing handwritten engineering notes.", type: "found", category: "Stationery", location: "Lecture Hall 1", dateLostFound: "2026-07-21", imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Apple Watch with Navy Strap", description: "Smart watch with a navy sport band; battery was empty when found.", type: "lost", category: "Electronics", location: "Oval Park", dateLostFound: "2026-07-13", imageUrl: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=1200&q=80", status: "claimed" },
  { title: "Canon DSLR Camera", description: "Canon camera body with an 18-55mm lens and black neck strap.", type: "found", category: "Electronics", location: "Research Park", dateLostFound: "2026-07-12", imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Purple Pencil Case", description: "Purple fabric pencil case containing highlighters and mechanical pencils.", type: "lost", category: "Stationery", location: "Lecture Hall 3", dateLostFound: "2026-07-18", imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Black Car Key Fob", description: "Single black vehicle key fob attached to a small metal ring.", type: "found", category: "Keys", location: "Student Parking Areas", dateLostFound: "2026-07-22", imageUrl: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "Cream Canvas Tote Bag", description: "Plain cream tote bag containing a paperback and stationery pouch.", type: "lost", category: "Bags", location: "Village Cafeterias", dateLostFound: "2026-07-17", imageUrl: "https://images.unsplash.com/photo-1597484662317-9bd7bdda2907?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "JBL Portable Speaker", description: "Small black cylindrical Bluetooth speaker with an orange logo.", type: "found", category: "Electronics", location: "Village 4 Student Centre", dateLostFound: "2026-07-16", imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80", status: "resolved" },
  { title: "Badminton Racket", description: "Blue and white badminton racket in a black zip cover.", type: "lost", category: "Sports Equipment", location: "Badminton Courts", dateLostFound: "2026-07-19", imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80", status: "open" },
  { title: "AirPods Charging Case", description: "White wireless earbud charging case found without the earbuds.", type: "found", category: "Electronics", location: "Pocket D", dateLostFound: "2026-07-23", imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=80", status: "open" },
] as const;

async function seed() {
  const existingUser = await db.select().from(usersTable).where(eq(usersTable.clerkUserId, DEMO_USER_ID)).limit(1);
  if (!existingUser.length) {
    await db.insert(usersTable).values({ clerkUserId: DEMO_USER_ID, email: DEMO_EMAIL, name: "CampusFound Demo" });
  }

  let inserted = 0;
  for (const item of sampleItems) {
    const existing = await db.select({ id: itemsTable.id }).from(itemsTable).where(eq(itemsTable.title, item.title)).limit(1);
    if (existing.length) continue;
    await db.insert(itemsTable).values({ ...item, userId: DEMO_USER_ID });
    inserted += 1;
  }

  console.log(`Seed complete: ${inserted} inserted, ${sampleItems.length - inserted} already existed.`);
}

try {
  await seed();
} finally {
  await pool.end();
}
