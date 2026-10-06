import pg from "pg";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const client = new pg.Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "primenest_db",
});

// 36 curated Indian luxury customer profiles
const targetCustomers = [
  { name: "Rohan Sharma", email: "rohan.google@gmail.com", phone: "+91 84529 72354", gender: "Male", city: "Surat", address: "103, Haridarshan, Katargam, Surat, Gujarat 395004" },
  { name: "Rohan Bhesara", email: "rohanbhesara@gmail.com", phone: "+91 98795 44102", gender: "Male", city: "Ahmedabad", address: "Skyline Villa 10, Bodakdev, SG Highway, Ahmedabad, GJ 380054" },
  { name: "Test User", email: "test@example.com", phone: "+91 98200 11223", gender: "Male", city: "Mumbai", address: "402 Oberoi Woods, Goregaon East, Mumbai, MH 400063" },
  { name: "Aarav Singhania", email: "aarav.singhania@gmail.com", phone: "+91 98201 44521", gender: "Male", city: "Mumbai", address: "Flat 14B, Imperial Heights, Altamount Road, Mumbai, MH 400026" },
  { name: "Ananya Mehra", email: "ananya.mehra92@outlook.com", phone: "+91 98112 55902", gender: "Female", city: "New Delhi", address: "B-4/22 Safdarjung Enclave, New Delhi, DL 110029" },
  { name: "Vikramaditya Roy", email: "vikram.roy@luxuryholdings.in", phone: "+91 98300 78120", gender: "Male", city: "Kolkata", address: "Penthouse 4, Ballygunge Circular Rd, Kolkata, WB 700019" },
  { name: "Tara Kapoor", email: "tara.kapoor@atelier.design", phone: "+91 99204 88319", gender: "Female", city: "Mumbai", address: "12 Gulmohar Cross Rd 7, JVPD Scheme, Juhu, Mumbai, MH 400049" },
  { name: "Kabir Malhotra", email: "kabir.malhotra@venturecap.com", phone: "+91 98711 44021", gender: "Male", city: "Gurgaon", address: "Villa 38, The Magnolias, Golf Course Road, Gurgaon, HR 122002" },
  { name: "Rhea Deshmukh", email: "rhea.deshmukh@gmail.com", phone: "+91 98220 33918", gender: "Female", city: "Pune", address: "702 Koregaon Park Annex, North Main Road, Pune, MH 411001" },
  { name: "Aditya Vardhan Reddy", email: "aditya.reddy@reddyinfra.com", phone: "+91 98490 12678", gender: "Male", city: "Hyderabad", address: "Road No 36, Jubilee Hills, Hyderabad, TS 500033" },
  { name: "Mira Nair Sen", email: "mira.sen@bangalorebio.com", phone: "+91 98450 67231", gender: "Female", city: "Bengaluru", address: "14 Lavelle Road, Shanthala Nagar, Bengaluru, KA 560001" },
  { name: "Devendra Rathore", email: "dev.rathore@heritagepalace.in", phone: "+91 94140 23119", gender: "Male", city: "Jaipur", address: "C-Scheme, Subhash Marg, Jaipur, RJ 302001" },
  { name: "Siddharth Chawla", email: "sid.chawla@fintechadvisors.com", phone: "+91 98101 99283", gender: "Male", city: "New Delhi", address: "24 Prithviraj Road, Lutyens Delhi, New Delhi, DL 110011" },
  { name: "Natasha Poonawalla", email: "natasha.p@equineholdings.com", phone: "+91 98230 45678", gender: "Female", city: "Mumbai", address: "Silver Beach Estate, Worli Sea Face, Mumbai, MH 400018" },
  { name: "Arjun Oberoi", email: "arjun.oberoi@oberoicapital.com", phone: "+91 98110 33491", gender: "Male", city: "New Delhi", address: "18 Friends Colony West, New Delhi, DL 110065" },
  { name: "Pooja Hegde", email: "pooja.hegde@creativelabs.in", phone: "+91 98451 90812", gender: "Female", city: "Bengaluru", address: "84 Defence Colony, Indiranagar, Bengaluru, KA 560038" },
  { name: "Meera Krishnan", email: "meera.krishnan@chennaitech.com", phone: "+91 98400 12345", gender: "Female", city: "Chennai", address: "Kotturpuram Riverview Apts, Chennai, TN 600085" },
  { name: "Shaan Merchant", email: "shaan.merchant@merchantgroup.in", phone: "+91 98200 99812", gender: "Male", city: "Mumbai", address: "Bandra Bandstand Vista, Mumbai, MH 400050" },
  { name: "Ishaan Tandon", email: "ishaan.tandon@alumni.isb.edu", phone: "+91 98765 43210", gender: "Male", city: "Chandigarh", address: "Sector 9-C, Chandigarh, CH 160009" },
  { name: "Dr. Alisha Verma", email: "alisha.verma@apexheart.org", phone: "+91 99102 34567", gender: "Female", city: "New Delhi", address: "Greater Kailash II, Enclave 1, New Delhi, DL 110048" },
  { name: "Zoya Akhtar Khan", email: "zoya.akhtar@cinemaspark.com", phone: "+91 98211 88765", gender: "Female", city: "Mumbai", address: "Pali Hill, Nargis Dutt Road, Bandra West, Mumbai, MH 400050" },
  { name: "Kunal Shah", email: "kunal.shah@highgrowth.in", phone: "+91 98455 66778", gender: "Male", city: "Bengaluru", address: "Richmond Town, Langford Road, Bengaluru, KA 560025" },
  { name: "Radhika Piramal", email: "radhika.piramal@piramalholdings.com", phone: "+91 98201 99012", gender: "Female", city: "Mumbai", address: "Piramal Aranya, Byculla, Mumbai, MH 400027" },
  { name: "Yashvardhan Birla", email: "yash.birla@birlacapital.in", phone: "+91 98102 33419", gender: "Male", city: "New Delhi", address: "Birla House, 5 Tees January Marg, New Delhi, DL 110011" },
  { name: "Samaira Mittal", email: "samaira.mittal@mittalsteel.org", phone: "+91 98302 44567", gender: "Female", city: "Kolkata", address: "Alipore Estates, Alipore Park Road, Kolkata, WB 700027" },
  { name: "Armaan Jain", email: "armaan.jain@jainmedia.com", phone: "+91 99201 88345", gender: "Male", city: "Mumbai", address: "24 Mount Mary Road, Bandra West, Mumbai, MH 400050" },
  { name: "Dia Mirza Khurana", email: "dia.khurana@mirzaenterprises.in", phone: "+91 98453 66120", gender: "Female", city: "Bengaluru", address: "Sadashivanagar 8th Main, Bengaluru, KA 560080" },
  { name: "Raghavendra Goenka", email: "raghav.goenka@goenkaindustries.com", phone: "+91 94142 88901", gender: "Male", city: "Jaipur", address: "Civil Lines, Raj Bhavan Marg, Jaipur, RJ 302006" },
  { name: "Trisha Krishnakumar", email: "trisha.k@heritagegems.co.in", phone: "+91 98402 77123", gender: "Female", city: "Chennai", address: "Boat Club Road, RA Puram, Chennai, TN 600028" },
  { name: "Varun Somani", email: "varun.somani@somanigroup.com", phone: "+91 98115 22904", gender: "Male", city: "Gurgaon", address: "The Camellias, DLF Phase 5, Gurgaon, HR 122009" },
  { name: "Sanjana Sanghi", email: "sanjana.sanghi@coutureatelier.in", phone: "+91 98224 55671", gender: "Female", city: "Pune", address: "Kalyani Nagar Waterfront, Pune, MH 411006" },
  { name: "Pranav Godrej", email: "pranav.godrej@godrejinfra.com", phone: "+91 98205 11982", gender: "Male", city: "Mumbai", address: "Godrej Sky, Byculla East, Mumbai, MH 400010" },
  { name: "Neha Dhupia Wadhwa", email: "neha.wadhwa@creativehouse.in", phone: "+91 98108 44321", gender: "Female", city: "New Delhi", address: "Sunder Nagar, Mathura Road, New Delhi, DL 110003" },
  { name: "Harshvardhan Ruia", email: "harsh.ruia@ruiaholdings.com", phone: "+91 98791 22345", gender: "Male", city: "Ahmedabad", address: "Ambli-Bopal Road, Ahmedabad, GJ 380058" },
  { name: "Avani Modi Parekh", email: "avani.parekh@parekhjewels.com", phone: "+91 98492 88765", gender: "Female", city: "Hyderabad", address: "Banjara Hills Road No 10, Hyderabad, TS 500034" },
  { name: "Ranveer Jindal", email: "ranveer.jindal@jindalventures.in", phone: "+91 98762 11098", gender: "Male", city: "Chandigarh", address: "Sector 4, Boulevard, Chandigarh, CH 160001" },
];

async function main() {
  await client.connect();
  console.log("Connected to database:", process.env.DB_NAME || "primenest_db");

  // Hash password for all users
  const defaultPasswordHash = await bcrypt.hash("User@12345", 10);
  console.log("Generated secure bcrypt password hash.");

  // 1. Insert or update all 36 users into `users` table
  const userMapByEmail = {};

  for (let i = 0; i < targetCustomers.length; i++) {
    const c = targetCustomers[i];
    // Dates distributed from Aug 15, 2026 to Oct 04, 2026
    const daysAgo = 50 - Math.floor((i * 45) / targetCustomers.length);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const checkRes = await client.query(
      "SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)",
      [c.email]
    );

    let userId;
    if (checkRes.rows.length > 0) {
      userId = checkRes.rows[0].id;
      await client.query(
        `UPDATE users
         SET name = $1, phone = $2, gender = $3, role = 'user', updated_at = NOW()
         WHERE id = $4`,
        [c.name, c.phone, c.gender, userId]
      );
      console.log(`Updated user #${userId}: ${c.name} (${c.email})`);
    } else {
      const insRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, phone, gender, created_at, updated_at)
         VALUES ($1, $2, $3, 'user', $4, $5, $6, NOW())
         RETURNING id`,
        [c.name, c.email, defaultPasswordHash, c.phone, c.gender, createdAt]
      );
      userId = insRes.rows[0].id;
      console.log(`Created user #${userId}: ${c.name} (${c.email})`);
    }

    userMapByEmail[c.email.toLowerCase()] = {
      id: userId,
      ...c,
    };
  }

  // 2. Fetch all 40 existing orders in DB
  const ordersRes = await client.query(
    "SELECT id, customer_name, email, phone, total, created_at FROM orders ORDER BY id ASC"
  );
  const orders = ordersRes.rows;
  console.log(`\nSynchronizing ${orders.length} orders with ${targetCustomers.length} registered users...`);

  // Assign distinct user to each order.
  // We have 40 orders and 36 users.
  // First 36 orders get 1 unique user each.
  // Remaining 4 orders (orders 36-39) are 2nd orders for top VIP buyers (Rohan Sharma, Rohan Bhesara, Aarav Singhania, Ananya Mehra).
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    let custIndex = i;
    if (custIndex >= targetCustomers.length) {
      custIndex = custIndex % 4; // repeat among first 4 VIP users
    }

    const assignedCust = targetCustomers[custIndex];
    const userObj = userMapByEmail[assignedCust.email.toLowerCase()];

    await client.query(
      `UPDATE orders
       SET customer_name = $1,
           email = $2,
           phone = $3,
           address = $4,
           user_id = $5
       WHERE id = $6`,
      [assignedCust.name, assignedCust.email, assignedCust.phone, assignedCust.address, userObj.id, order.id]
    );

    console.log(`[Order #${order.id}] Linked to User #${userObj.id} (${assignedCust.name}, ${assignedCust.email})`);
  }

  // 3. Verification: Query admin customers view
  const adminCustomersView = await client.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      COALESCE(order_stats.order_count, 0)::int AS order_count,
      COALESCE(order_stats.total_spent, 0)::numeric AS total_spent
    FROM users u
    LEFT JOIN (
      SELECT
        email,
        COUNT(*)::int AS order_count,
        SUM(total) AS total_spent
      FROM orders
      GROUP BY email
    ) AS order_stats
      ON LOWER(order_stats.email) = LOWER(u.email)
    WHERE u.role = 'user'
    ORDER BY total_spent DESC, u.id ASC
  `);

  console.log("\n================ ADMIN CUSTOMERS VERIFICATION ================");
  console.log(`Total registered customers: ${adminCustomersView.rows.length}`);
  console.table(adminCustomersView.rows.map(r => ({
    userId: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    orderCount: r.order_count,
    totalSpent: `₹${Number(r.total_spent).toLocaleString('en-IN')}`
  })));

  // Total orders check
  const orderCountCheck = await client.query("SELECT COUNT(*) FROM orders");
  console.log(`Total orders in DB: ${orderCountCheck.rows[0].count}`);

  await client.end();
}

main().catch((err) => {
  console.error("Error seeding users with orders:", err);
  process.exit(1);
});
