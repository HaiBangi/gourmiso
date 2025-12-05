import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "ngmich95@gmail.com" },
    select: { id: true, email: true, pseudo: true, role: true },
  });

  console.log("User info:");
  console.log(user);

  if (user) {
    // Check a few recipes
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
      take: 5,
      select: { id: true, name: true, userId: true },
    });

    console.log("\nRecipes owned by this user:");
    recipes.forEach((r) => console.log(`  ID: ${r.id}, Name: "${r.name}", UserId: ${r.userId}`));

    // Check if userId matches exactly
    console.log("\nUser ID:", user.id);
    console.log("User ID length:", user.id.length);
    console.log("User ID type:", typeof user.id);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

