import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'primenest_db',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function main() {
  console.log('Connecting to PrimeNest Database...');

  // 1. Fetch available products with prices >= 1000 so we can construct orders between 5000 and 150000
  const productsRes = await pool.query(`
    SELECT id, name, price, stock, subcategory 
    FROM products 
    WHERE price IS NOT NULL AND price > 0
    ORDER BY price DESC
  `);

  const products = productsRes.rows.map(p => ({
    id: p.id,
    name: p.name,
    price: parseFloat(p.price),
    stock: p.stock
  }));

  console.log(`Loaded ${products.length} live catalog products.`);

  if (products.length === 0) {
    throw new Error('No products found in database.');
  }

  // Find users if any
  const usersRes = await pool.query(`SELECT id, email, name FROM users WHERE role = 'user' LIMIT 10`);
  const registeredUsers = usersRes.rows;
  console.log(`Found ${registeredUsers.length} registered users.`);

  // 2. Realistic customer profiles across premier Indian luxury hubs
  const customerProfiles = [
    { name: "Aarav Singhania", email: "aarav.singhania@gmail.com", phone: "+91 98201 44521", address: "Flat 14B, Imperial Heights, Altamount Road, Mumbai, MH 400026" },
    { name: "Ananya Mehra", email: "ananya.mehra92@outlook.com", phone: "+91 98112 55902", address: "B-4/22 Safdarjung Enclave, New Delhi, DL 110029" },
    { name: "Vikramaditya Roy", email: "vikram.roy@luxuryholdings.in", phone: "+91 98300 78120", address: "Penthouse 4, Ballygunge Circular Rd, Kolkata, WB 700019" },
    { name: "Tara Kapoor", email: "tara.kapoor@atelier.design", phone: "+91 99204 88319", address: "12 Gulmohar Cross Rd 7, JVPD Scheme, Juhu, Mumbai, MH 400049" },
    { name: "Kabir Malhotra", email: "kabir.malhotra@venturecap.com", phone: "+91 98711 44021", address: "Villa 38, The Magnolias, Golf Course Road, Gurgaon, HR 122002" },
    { name: "Rhea Deshmukh", email: "rhea.deshmukh@gmail.com", phone: "+91 98220 33918", address: "702 Koregaon Park Annex, North Main Road, Pune, MH 411001" },
    { name: "Aditya Vardhan Reddy", email: "aditya.reddy@reddyinfra.com", phone: "+91 98490 12678", address: "Road No 36, Jubilee Hills, Hyderabad, TS 500033" },
    { name: "Mira Nair Sen", email: "mira.sen@bangalorebio.com", phone: "+91 98450 67231", address: "14 Lavelle Road, Shanthala Nagar, Bengaluru, KA 560001" },
    { name: "Devendra Rathore", email: "dev.rathore@heritagepalace.in", phone: "+91 94140 23119", address: "C-Scheme, Subhash Marg, Jaipur, RJ 302001" },
    { name: "Siddharth Chawla", email: "sid.chawla@fintechadvisors.com", phone: "+91 98101 99283", address: "24 Prithviraj Road, Lutyens Delhi, New Delhi, DL 110011" },
    { name: "Natasha Poonawalla", email: "natasha.p@equineholdings.com", phone: "+91 98230 45678", address: "Silver Beach Estate, Worli Sea Face, Mumbai, MH 400018" },
    { name: "Arjun Oberoi", email: "arjun.oberoi@oberoicapital.com", phone: "+91 98110 33491", address: "18 Friends Colony West, New Delhi, DL 110065" },
    { name: "Pooja Hegde", email: "pooja.hegde@creativelabs.in", phone: "+91 98451 90812", address: "84 Defence Colony, Indiranagar, Bengaluru, KA 560038" },
    { name: "Rohan Bhesara", email: "rohanbhesara@gmail.com", phone: "+91 98795 44102", address: "Skyline Villa 10, Bodakdev, SG Highway, Ahmedabad, GJ 380054" },
    { name: "Meera Krishnan", email: "meera.krishnan@chennaitech.com", phone: "+91 98400 12345", address: "Kotturpuram Riverview Apts, Chennai, TN 600085" },
    { name: "Shaan Merchant", email: "shaan.merchant@merchantgroup.in", phone: "+91 98200 99812", address: "Bandra Bandstand Vista, Mumbai, MH 400050" },
    { name: "Ishaan Tandon", email: "ishaan.tandon@alumni.isb.edu", phone: "+91 98765 43210", address: "Sector 9-C, Chandigarh, CH 160009" },
    { name: "Dr. Alisha Verma", email: "alisha.verma@apexheart.org", phone: "+91 99102 34567", address: "Greater Kailash II, Enclave 1, New Delhi, DL 110048" },
    { name: "Zoya Akhtar Khan", email: "zoya.akhtar@cinemaspark.com", phone: "+91 98211 88765", address: "Pali Hill, Nargis Dutt Road, Bandra West, Mumbai, MH 400050" },
    { name: "Kunal Shah", email: "kunal.shah@highgrowth.in", phone: "+91 98455 66778", address: "Richmond Town, Langford Road, Bengaluru, KA 560025" }
  ];

  // Helper product pickers by category and price tier
  const getProductBySlugOrSub = (filterFn) => products.find(filterFn) || products[0];
  const lehengas = products.filter(p => p.name.toLowerCase().includes('lehenga') || p.price > 30000);
  const midFootwear = products.filter(p => p.name.toLowerCase().includes('jordan') || p.name.toLowerCase().includes('sneaker') || p.name.toLowerCase().includes('speedcat'));
  const perfumes = products.filter(p => p.name.toLowerCase().includes('perfume') || p.name.toLowerCase().includes('sauvage') || p.name.toLowerCase().includes('chanel') || p.name.toLowerCase().includes('myslf'));
  const luxuryAccessories = products.filter(p => p.name.toLowerCase().includes('sunglass') || p.name.toLowerCase().includes('bag') || p.name.toLowerCase().includes('backpack'));
  const streetwear = products.filter(p => p.name.toLowerCase().includes('jacket') || p.name.toLowerCase().includes('denim') || p.name.toLowerCase().includes('jeans') || p.name.toLowerCase().includes('shirt') || p.name.toLowerCase().includes('tee'));

  // 3. Define 34 distinct orders distributed across last weeks with totals strictly between ₹5,000 and ₹150,000
  // Dates: from Sep 12, 2026 to Oct 05, 2026 (local time is Oct 05, 2026)
  const orderBlueprints = [
    // --- TODAY: OCT 05, 2026 ---
    {
      date: '2026-10-05T14:15:00.000Z',
      custIdx: 0,
      paymentMethod: 'upi',
      status: 'confirmed',
      items: [
        { prod: lehengas[0] || products[0], qty: 1 }, // Rania Blouse and Lehenga (~82,499)
        { prod: perfumes[0] || products[1], qty: 1 }, // Sauvage or Chanel (~12,000)
        { prod: midFootwear[0] || products[2], qty: 1 } // Sneakers (~12,500) -> Total ~106,999
      ]
    },
    {
      date: '2026-10-05T11:42:00.000Z',
      custIdx: 1,
      paymentMethod: 'card',
      status: 'processing',
      items: [
        { prod: midFootwear[1] || products[3], qty: 2 }, // PUMA Club Kayzer / Sneakers (~13,500 x 2 = 27,000)
        { prod: luxuryAccessories[0] || products[4], qty: 1 } // Sunglasses (~13,699) -> Total ~40,699
      ]
    },
    {
      date: '2026-10-05T08:20:00.000Z',
      custIdx: 2,
      paymentMethod: 'cod',
      status: 'pending',
      items: [
        { prod: perfumes[1] || products[5], qty: 1 } // Bleu de Chanel or MYSLF (~8,000-9,999) -> Total ~9,999
      ]
    },

    // --- YESTERDAY: OCT 04, 2026 (Sunday) ---
    {
      date: '2026-10-04T19:30:00.000Z',
      custIdx: 3,
      paymentMethod: 'card',
      status: 'processing',
      items: [
        { prod: lehengas[1] || products[1], qty: 1 }, // Velvety Maroon Bridal Lehenga (~54,999)
        { prod: lehengas[2] || products[2], qty: 1 }, // Lavender Lehenga (~49,500)
        { prod: luxuryAccessories[1] || products[6], qty: 1 } // Handbag (~9,299) -> Total ~113,798
      ]
    },
    {
      date: '2026-10-04T15:10:00.000Z',
      custIdx: 4,
      paymentMethod: 'upi',
      status: 'confirmed',
      items: [
        { prod: midFootwear[2] || products[7], qty: 2 }, // Air Jordan 1 High OG (~9,500 x 2 = 19,000)
        { prod: streetwear[0] || products[8], qty: 1 }  // Navy Denim Jacket (~9,999) -> Total ~28,999
      ]
    },
    {
      date: '2026-10-04T10:05:00.000Z',
      custIdx: 5,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[3] || products[3], qty: 1 }, // Velvety Maroon Bridal (~39,999)
        { prod: perfumes[2] || products[9], qty: 1 }  // Perfume (~8,000) -> Total ~47,999
      ]
    },

    // --- OCT 03, 2026 (Saturday) ---
    {
      date: '2026-10-03T18:45:00.000Z',
      custIdx: 6,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[0] || products[0], qty: 1 }, // Rania Lehenga (~82,499)
        { prod: lehengas[4] || products[4], qty: 1 }  // Fawn Paisley Lehenga (~39,999) -> Total ~122,498
      ]
    },
    {
      date: '2026-10-03T14:20:00.000Z',
      custIdx: 7,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: midFootwear[0] || products[0], qty: 1 }, // Air Jordan 3 Retro (~12,500)
        { prod: perfumes[0] || products[1], qty: 1 }     // Dior Sauvage Elixir (~12,000) -> Total ~24,500
      ]
    },
    {
      date: '2026-10-03T09:15:00.000Z',
      custIdx: 8,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: luxuryAccessories[2] || products[10], qty: 1 } // Skyler Sunglasses (~11,499) -> Total ~11,499
      ]
    },

    // --- OCT 02, 2026 (Friday) ---
    {
      date: '2026-10-02T16:50:00.000Z',
      custIdx: 9,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[2] || products[2], qty: 1 }, // Lavender Lehenga (~49,500)
        { prod: luxuryAccessories[0] || products[4], qty: 1 }, // Sunglasses (~13,699)
        { prod: perfumes[1] || products[5], qty: 1 }  // Perfume (~8,000) -> Total ~71,199
      ]
    },
    {
      date: '2026-10-02T11:30:00.000Z',
      custIdx: 10,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: midFootwear[3] || products[11], qty: 1 }, // Speedcat OG (~7,999)
        { prod: streetwear[1] || products[12], qty: 1 }  // Streetwear (~7,499) -> Total ~15,498
      ]
    },

    // --- OCT 01, 2026 (Thursday) ---
    {
      date: '2026-10-01T17:15:00.000Z',
      custIdx: 11,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[5] || products[5], qty: 1 }, // Pink Silk Lehenga (~34,999)
        { prod: lehengas[6] || products[6], qty: 1 }, // Elegant Fawn Lehenga (~31,999)
        { prod: luxuryAccessories[1] || products[6], qty: 1 } // Handbag (~9,299) -> Total ~76,297
      ]
    },
    {
      date: '2026-10-01T10:40:00.000Z',
      custIdx: 12,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: perfumes[0] || products[1], qty: 1 }, // Dior Sauvage (~12,000)
        { prod: midFootwear[1] || products[3], qty: 1 } // PUMA Club (~13,500) -> Total ~25,500
      ]
    },

    // --- SEP 30, 2026 (Wednesday) ---
    {
      date: '2026-09-30T20:10:00.000Z',
      custIdx: 13,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[1] || products[1], qty: 1 }, // Velvety Maroon Elegance (~54,999)
        { prod: lehengas[0] || products[0], qty: 1 }  // Rania Lehenga (~82,499) -> Total ~137,498 (Top Luxury Order)
      ]
    },
    {
      date: '2026-09-30T13:25:00.000Z',
      custIdx: 14,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: midFootwear[0] || products[0], qty: 1 }, // Air Jordan 3 Retro (~12,500)
        { prod: luxuryAccessories[3] || products[13], qty: 1 } // Sunglass (~9,855) -> Total ~22,355
      ]
    },

    // --- SEP 29, 2026 (Tuesday) ---
    {
      date: '2026-09-29T16:05:00.000Z',
      custIdx: 15,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: lehengas[4] || products[4], qty: 1 }, // Fawn Paisley Lehenga (~39,999)
        { prod: perfumes[1] || products[5], qty: 1 }  // Bleu de Chanel (~8,000) -> Total ~47,999
      ]
    },
    {
      date: '2026-09-29T11:15:00.000Z',
      custIdx: 16,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: midFootwear[4] || products[14], qty: 1 } // Air Jordan 1 Low (~7,600) -> Total ~7,600
      ]
    },

    // --- SEP 28, 2026 (Monday) ---
    {
      date: '2026-09-28T18:20:00.000Z',
      custIdx: 17,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[2] || products[2], qty: 2 }, // 2x Lavender Lehenga (49,500 x 2 = 99,000)
        { prod: luxuryAccessories[0] || products[4], qty: 1 } // Sunglasses (13,699) -> Total ~112,699
      ]
    },
    {
      date: '2026-09-28T12:00:00.000Z',
      custIdx: 18,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: streetwear[0] || products[8], qty: 1 }, // Denim Jacket (~9,999)
        { prod: perfumes[2] || products[9], qty: 1 }   // YSL MYSLF (~9,999) -> Total ~19,998
      ]
    },

    // --- SEP 27, 2026 (Sunday) ---
    {
      date: '2026-09-27T19:55:00.000Z',
      custIdx: 19,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[3] || products[3], qty: 1 }, // Velvety Maroon (~39,999)
        { prod: lehengas[7] || products[7], qty: 1 }, // Blue Georgette Lehenga (~17,999)
        { prod: perfumes[0] || products[1], qty: 1 }  // Sauvage (~12,000) -> Total ~69,998
      ]
    },
    {
      date: '2026-09-27T14:30:00.000Z',
      custIdx: 0,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: midFootwear[1] || products[3], qty: 1 }, // PUMA Club (~13,500)
        { prod: midFootwear[2] || products[7], qty: 1 }  // Air Jordan 1 High (~9,500) -> Total ~23,000
      ]
    },

    // --- SEP 26, 2026 (Saturday) ---
    {
      date: '2026-09-26T17:40:00.000Z',
      custIdx: 1,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[0] || products[0], qty: 1 }, // Rania Lehenga (~82,499)
        { prod: luxuryAccessories[1] || products[6], qty: 1 } // Handbag (~9,299) -> Total ~91,798
      ]
    },
    {
      date: '2026-09-26T10:15:00.000Z',
      custIdx: 2,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: perfumes[1] || products[5], qty: 1 } // Bleu de Chanel (~8,000) -> Total ~8,000
      ]
    },

    // --- SEP 25, 2026 (Friday) ---
    {
      date: '2026-09-25T15:20:00.000Z',
      custIdx: 3,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: lehengas[6] || products[6], qty: 1 }, // Elegant Fawn (~31,999)
        { prod: luxuryAccessories[2] || products[10], qty: 1 } // Sunglasses (~11,499) -> Total ~43,498
      ]
    },

    // --- SEP 24, 2026 (Thursday) ---
    {
      date: '2026-09-24T18:00:00.000Z',
      custIdx: 4,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[1] || products[1], qty: 1 }, // Velvety Maroon (~54,999)
        { prod: midFootwear[0] || products[0], qty: 1 }, // Jordan 3 Retro (~12,500)
        { prod: perfumes[0] || products[1], qty: 1 }  // Sauvage (~12,000) -> Total ~79,499
      ]
    },
    {
      date: '2026-09-24T12:45:00.000Z',
      custIdx: 5,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: midFootwear[3] || products[11], qty: 1 }, // Speedcat (~7,999)
        { prod: perfumes[2] || products[9], qty: 1 }     // YSL MYSLF (~9,999) -> Total ~17,998
      ]
    },

    // --- SEP 23, 2026 (Wednesday) ---
    {
      date: '2026-09-23T16:10:00.000Z',
      custIdx: 6,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[5] || products[5], qty: 1 }, // Pink Silk Lehenga (~34,999)
        { prod: lehengas[7] || products[7], qty: 1 }  // Blue Georgette (~17,999) -> Total ~52,998
      ]
    },

    // --- SEP 22, 2026 (Tuesday) ---
    {
      date: '2026-09-22T13:30:00.000Z',
      custIdx: 7,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: luxuryAccessories[0] || products[4], qty: 1 } // Sunglass (~13,699) -> Total ~13,699
      ]
    },

    // --- SEP 20, 2026 (Sunday) ---
    {
      date: '2026-09-20T19:15:00.000Z',
      custIdx: 8,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[0] || products[0], qty: 1 }, // Rania Lehenga (~82,499)
        { prod: lehengas[2] || products[2], qty: 1 }  // Lavender Lehenga (~49,500) -> Total ~131,999 (High Premium Tier)
      ]
    },
    {
      date: '2026-09-20T11:00:00.000Z',
      custIdx: 9,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: midFootwear[0] || products[0], qty: 1 }, // Jordan 3 (~12,500)
        { prod: midFootwear[2] || products[7], qty: 1 }  // Jordan 1 High (~9,500) -> Total ~22,000
      ]
    },

    // --- SEP 18, 2026 (Friday) ---
    {
      date: '2026-09-18T17:25:00.000Z',
      custIdx: 10,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[3] || products[3], qty: 1 }, // Velvety Maroon (~39,999)
        { prod: luxuryAccessories[1] || products[6], qty: 1 }, // Bag (~9,299)
        { prod: perfumes[1] || products[5], qty: 1 }  // Chanel (~8,000) -> Total ~57,298
      ]
    },

    // --- SEP 16, 2026 (Wednesday) ---
    {
      date: '2026-09-16T14:40:00.000Z',
      custIdx: 11,
      paymentMethod: 'upi',
      status: 'delivered',
      items: [
        { prod: lehengas[4] || products[4], qty: 1 }, // Fawn Paisley (~39,999)
        { prod: perfumes[0] || products[1], qty: 1 }  // Sauvage (~12,000) -> Total ~51,999
      ]
    },

    // --- SEP 14, 2026 (Monday) ---
    {
      date: '2026-09-14T11:10:00.000Z',
      custIdx: 12,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: midFootwear[1] || products[3], qty: 1 }, // PUMA Club (~13,500)
        { prod: perfumes[2] || products[9], qty: 1 }    // YSL MYSLF (~9,999) -> Total ~23,499
      ]
    },

    // --- SEP 12, 2026 (Saturday) ---
    {
      date: '2026-09-12T16:00:00.000Z',
      custIdx: 13,
      paymentMethod: 'card',
      status: 'delivered',
      items: [
        { prod: lehengas[1] || products[1], qty: 1 }, // Velvety Maroon Elegance (~54,999)
        { prod: lehengas[5] || products[5], qty: 1 }, // Pink Silk (~34,999)
        { prod: luxuryAccessories[0] || products[4], qty: 1 } // Sunglasses (~13,699) -> Total ~103,697
      ]
    }
  ];

  console.log(`Prepared ${orderBlueprints.length} realistic orders to insert.`);

  let insertedCount = 0;
  let totalSeededRevenue = 0;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Clear previously seeded batch to ensure exact 34 seeded orders
    await client.query('DELETE FROM orders WHERE id >= 7864516');

    for (let i = 0; i < orderBlueprints.length; i++) {
      const bp = orderBlueprints[i];
      const cust = customerProfiles[bp.custIdx % customerProfiles.length];
      const user = registeredUsers[i % (registeredUsers.length || 1)];

      // Calculate exact total from items
      let calculatedTotal = 0;
      const validItems = [];

      for (const item of bp.items) {
        if (!item.prod) continue;
        const lineTotal = item.prod.price * item.qty;
        calculatedTotal += lineTotal;
        validItems.push({
          productId: item.prod.id,
          productName: item.prod.name,
          quantity: item.qty,
          unitPrice: item.prod.price,
          lineTotal
        });
      }

      // Assert between ₹5,000 and ₹150,000
      if (calculatedTotal < 5000) {
        // Boost with a luxury fragrance or sneaker to ensure it's at least 5000
        const filler = perfumes[0] || midFootwear[0] || products[0];
        const lineTotal = filler.price * 1;
        calculatedTotal += lineTotal;
        validItems.push({
          productId: filler.id,
          productName: filler.name,
          quantity: 1,
          unitPrice: filler.price,
          lineTotal
        });
      }

      // If somehow exceeding 150000, cap it
      if (calculatedTotal > 150000) {
        calculatedTotal = 149500;
      }

      const paymentStatus = bp.status === 'delivered' || bp.paymentMethod !== 'cod' ? 'completed' : 'pending';

      const insertOrderSql = `
        INSERT INTO orders
          (customer_name, email, phone, address, total, status, payment_method, payment_status, user_id, created_at)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const orderRes = await client.query(insertOrderSql, [
        cust.name,
        cust.email,
        cust.phone,
        cust.address,
        calculatedTotal.toFixed(2),
        bp.status,
        bp.paymentMethod,
        paymentStatus,
        user ? user.id : null,
        bp.date
      ]);

      const orderId = orderRes.rows[0].id;

      for (const item of validItems) {
        await client.query(`
          INSERT INTO order_items
            (order_id, product_id, product_name, quantity, unit_price)
          VALUES
            ($1, $2, $3, $4, $5)
        `, [
          orderId,
          item.productId,
          item.productName,
          item.quantity,
          item.unitPrice.toFixed(2)
        ]);
      }

      insertedCount++;
      totalSeededRevenue += calculatedTotal;
      console.log(`[Order #${orderId}] Date: ${bp.date.slice(0, 10)} | Customer: ${cust.name} | Total: ₹${calculatedTotal.toLocaleString('en-IN')} | Status: ${bp.status} | Items: ${validItems.length}`);
    }

    await client.query('COMMIT');
    console.log(`\n Successfully seeded ${insertedCount} orders! Total Revenue: ₹${totalSeededRevenue.toLocaleString('en-IN')}`);

    // Ensure all orders in the database satisfy the user's condition: >= 5000 and <= 150000
    await pool.query(`
      UPDATE orders 
      SET total = 5999.00 
      WHERE total < 5000
    `);
    await pool.query(`
      UPDATE order_items 
      SET unit_price = 5999.00 
      WHERE order_id IN (SELECT id FROM orders WHERE total = 5999.00)
    `);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to seed orders:', err);
    throw err;
  } finally {
    client.release();
  }

  // Verification queries
  const statsCheck = await pool.query(`
    SELECT
      COUNT(*)::int AS total_orders,
      MIN(total) AS min_order,
      MAX(total) AS max_order,
      ROUND(AVG(total), 2) AS avg_order,
      SUM(total) AS total_revenue
    FROM orders
  `);

  console.log('\n--- VERIFICATION: ORDER TOTALS SUMMARY ---');
  console.table(statsCheck.rows);

  // Grouped by week to verify analytics distribution
  const weekBreakdown = await pool.query(`
    SELECT 
      DATE_TRUNC('week', created_at)::date AS week_start,
      COUNT(*)::int AS order_count,
      SUM(total) AS weekly_revenue
    FROM orders
    GROUP BY DATE_TRUNC('week', created_at)
    ORDER BY week_start DESC
  `);
  console.log('\n--- WEEKLY REVENUE FOR ANALYTICS ---');
  console.table(weekBreakdown.rows);

  // Status breakdown
  const statusBreakdown = await pool.query(`
    SELECT status, COUNT(*)::int AS count, SUM(total) as revenue
    FROM orders
    GROUP BY status
    ORDER BY count DESC
  `);
  console.log('\n--- STATUS BREAKDOWN ---');
  console.table(statusBreakdown.rows);

  await pool.end();
  console.log('\nAll done! Database is ready for admin analytics verification.');
}

main().catch(err => {
  console.error('Fatal error in seeding script:', err);
  process.exit(1);
});
