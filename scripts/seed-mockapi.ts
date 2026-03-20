// Run this script using bun:
// bun run scripts/seed-mockapi.ts

const MOCKAPI_PLANTS_URL = "https://69bcac962bc2a25b22ac140b.mockapi.io/api/v1/plants";
const SALES_STATS_URL = "https://69bce6272bc2a25b22acb171.mockapi.io/api/v1/sales-stats";

async function seedSalesStats() {
  console.log("Fetching current plants from API...");
  try {
    const plantsRes = await fetch(MOCKAPI_PLANTS_URL);
    if (!plantsRes.ok) {
      throw new Error(`Failed to fetch plants: ${plantsRes.statusText}`);
    }
    
    const plants = await plantsRes.json();
    console.log(`Fetched ${plants.length} plants.`);

    const topProducts = plants.map((p: any) => ({
      productId: Number(p.id),
      productName: p.name,
      sold: Number(p.sold) || 0,
      revenue: (Number(p.sold) || 0) * (Number(p.price) || 0),
    })).filter((p: any) => p.sold > 0);

    const totalItemsSold = topProducts.reduce((sum: number, p: any) => sum + p.sold, 0);
    const totalRevenue = topProducts.reduce((sum: number, p: any) => sum + p.revenue, 0);
    const totalOrders = Math.max(1, Math.ceil(totalItemsSold / 2)); // rough estimation

    const initialSalesStats = {
      totalOrders: totalItemsSold > 0 ? totalOrders : 0,
      totalItemsSold,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      topProducts,
    };

    console.log("Computed initial sales stats:", JSON.stringify(initialSalesStats, null, 2));

    const res = await fetch(`${SALES_STATS_URL}/1`);
    if (res.ok) {
      console.log("Updating existing sales stats (ID: 1)...");
      const updateRes = await fetch(`${SALES_STATS_URL}/1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialSalesStats),
      });
      console.log("Update status:", updateRes.status);
    } else {
      console.log("Creating new sales stats record (ID: 1)...");
      const createRes = await fetch(SALES_STATS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...initialSalesStats, id: "1" }),
      });
      console.log("Create status:", createRes.status);
    }
    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding MockAPI:", error);
  }
}

seedSalesStats();
