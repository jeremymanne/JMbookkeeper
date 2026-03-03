import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding BookKeeper database...");

  // Default Income Categories
  const incomeCategories = [
    { name: "Client Services", color: "#10B981", sortOrder: 1 },
    { name: "Consulting", color: "#3B82F6", sortOrder: 2 },
    { name: "Retainer Fees", color: "#8B5CF6", sortOrder: 3 },
    { name: "Project Revenue", color: "#06B6D4", sortOrder: 4 },
    { name: "Other Income", color: "#6B7280", sortOrder: 5 },
  ];

  for (const cat of incomeCategories) {
    await prisma.category.create({
      data: { ...cat, type: "income" },
    });
  }
  console.log(`  Created ${incomeCategories.length} income categories`);

  // Default Expense Categories
  const expenseCategories = [
    { name: "Advertising & Marketing", color: "#EF4444", sortOrder: 1 },
    { name: "Software & Subscriptions", color: "#F59E0B", sortOrder: 2 },
    { name: "Contract Labor", color: "#EC4899", sortOrder: 3 },
    { name: "Office Supplies", color: "#84CC16", sortOrder: 4 },
    { name: "Travel & Transportation", color: "#14B8A6", sortOrder: 5 },
    { name: "Meals & Entertainment", color: "#F97316", sortOrder: 6 },
    { name: "Professional Services", color: "#6366F1", sortOrder: 7 },
    { name: "Insurance", color: "#0EA5E9", sortOrder: 8 },
    { name: "Taxes & Licenses", color: "#DC2626", sortOrder: 9 },
    { name: "Utilities & Internet", color: "#A855F7", sortOrder: 10 },
    { name: "Education & Training", color: "#22D3EE", sortOrder: 11 },
    { name: "Bank Fees", color: "#78716C", sortOrder: 12 },
    { name: "Miscellaneous", color: "#9CA3AF", sortOrder: 13 },
  ];

  for (const cat of expenseCategories) {
    await prisma.category.create({
      data: { ...cat, type: "expense" },
    });
  }
  console.log(`  Created ${expenseCategories.length} expense categories`);

  // Default Settings
  const defaultSettings = [
    { key: "business_name", value: "" },
    { key: "business_address", value: "" },
    { key: "business_email", value: "" },
    { key: "business_phone", value: "" },
    { key: "invoice_prefix", value: "INV-" },
    { key: "next_invoice_number", value: "1001" },
    { key: "default_payment_terms", value: "Net 30" },
    { key: "default_tax_rate", value: "0" },
    { key: "fiscal_year_start", value: "january" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`  Created ${defaultSettings.length} default settings`);

  // Sample Vendors
  const sampleVendors = [
    { name: "John Smith", company: "Smith Consulting LLC", email: "john@smithconsulting.com", phone: "(555) 100-2000", taxId: "12-3456789" },
    { name: "Jane Doe", company: "Doe Design Studio", email: "jane@doedesign.com", phone: "(555) 200-3000", taxId: "98-7654321" },
    { name: "Tech Solutions Inc", company: "Tech Solutions Inc", email: "billing@techsolutions.com", phone: "(555) 300-4000", taxId: "11-2233445" },
  ];

  for (const vendor of sampleVendors) {
    await prisma.vendor.create({ data: vendor });
  }
  console.log(`  Created ${sampleVendors.length} sample vendors`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
