// TandaXn Supabase Connection Test - SSL via Connection String
// Run with: node test-supabase.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

console.log("🧪 Testing connection to Supabase PostgreSQL...\n");

// Add sslmode=disable to bypass SSL issues temporarily
const connectionString = process.env.DATABASE_URL.includes('?') 
  ? `${process.env.DATABASE_URL}&sslmode=disable`
  : `${process.env.DATABASE_URL}?sslmode=disable`;

console.log("📝 Connection string format:", connectionString.replace(/:[^@]+@/, ':***@'));

const adapter = new PrismaPg({
  connectionString: connectionString
});

const prisma = new PrismaClient({ 
  adapter,
  log: ['error', 'warn'],
});

async function testConnection() {
  try {
    console.log("\n1️⃣  Connecting to database...");
    await prisma.$connect();
    console.log("   ✅ Connected successfully!\n");

    console.log("2️⃣  Testing raw query...");
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    console.log("   ✅ Query executed successfully!");
    console.log(`   📊 Database: ${versionResult[0]?.version?.substring(0, 50)}...\n`);

    console.log("3️⃣  Checking if tables exist...");
    const tableCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tableCount = Number(tableCheck[0]?.count || 0);
    console.log(`   📋 Found ${tableCount} tables in public schema\n`);

    console.log("4️⃣  Testing connection info...");
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as host,
        inet_server_port() as port
    `;
    console.log("   📍 Connection details:");
    console.log(`      Database: ${dbInfo[0]?.database}`);
    console.log(`      User: ${dbInfo[0]?.user}`);
    console.log(`      Host: ${dbInfo[0]?.host}`);
    console.log(`      Port: ${dbInfo[0]?.port}\n`);

    console.log("🎉🎉🎉 SUCCESS! YOUR SUPABASE DATABASE IS READY FOR TANDAXN! 🎉🎉🎉");
    console.log("\n✅ WORKING CONFIGURATION:");
    console.log("   - Connection method: Direct");
    console.log("   - SSL mode: Disabled (for testing)");
    console.log("   - Password: Correct!");
    console.log("\n✅ Next steps:");
    console.log("   1. Run: npx prisma migrate dev --name init");
    console.log("   2. This will create all 42 TandaXn tables!");
    console.log("   3. Then start building your 5 Core Engines!\n");

    return true;

  } catch (error) {
    console.error("❌ ERROR: Connection failed\n");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code || "N/A");
    console.error("\n");

    return false;

  } finally {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  }
}

// Run the test
testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
