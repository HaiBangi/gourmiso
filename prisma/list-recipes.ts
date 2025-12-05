import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: { id: true, name: true, author: true, userId: true },
    orderBy: { id: "asc" },
  });

  console.log("All recipes:\n");
  recipes.forEach((r) => {
    console.log(`ID: ${r.id} | Author: "${r.author}" | UserId: ${r.userId || "NULL"} | Name: "${r.name}"`);
  });

  console.log(`\nTotal: ${recipes.length} recipes`);

  // Count by userId status
  const withUser = recipes.filter((r) => r.userId !== null).length;
  const withoutUser = recipes.filter((r) => r.userId === null).length;
  console.log(`With userId: ${withUser}, Without userId: ${withoutUser}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

