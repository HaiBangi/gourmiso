import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Email of the user to assign recipes to
const USER_EMAIL = "ngmich95@gmail.com";

// Authors that belong to this user
const USER_AUTHORS = ["Mich", "Mom"];

async function main() {
  console.log("🔄 Assigning userId to existing recipes...\n");

  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email: USER_EMAIL },
    select: { id: true, email: true, pseudo: true },
  });

  if (!user) {
    console.error(`❌ User with email ${USER_EMAIL} not found!`);
    console.log("\nAvailable users:");
    const users = await prisma.user.findMany({
      select: { id: true, email: true, pseudo: true },
    });
    users.forEach((u) => console.log(`  - ${u.email} (${u.pseudo})`));
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})\n`);

  // Find all recipes without userId that match the author names
  const recipesWithoutUser = await prisma.recipe.findMany({
    where: {
      userId: null,
      author: { in: USER_AUTHORS },
    },
    select: { id: true, name: true, author: true },
  });

  console.log(`📋 Found ${recipesWithoutUser.length} recipes to update:\n`);

  if (recipesWithoutUser.length === 0) {
    console.log("No recipes need updating.");
    return;
  }

  // Update each recipe
  for (const recipe of recipesWithoutUser) {
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { userId: user.id },
    });
    console.log(`  ✅ Updated: "${recipe.name}" (author: ${recipe.author})`);
  }

  console.log(`\n🎉 Successfully assigned ${recipesWithoutUser.length} recipes to ${user.email}!`);

  // Also show recipes that still have no userId (other authors)
  const remainingOrphans = await prisma.recipe.findMany({
    where: { userId: null },
    select: { id: true, name: true, author: true },
  });

  if (remainingOrphans.length > 0) {
    console.log(`\n⚠️  ${remainingOrphans.length} recipes still have no userId (different authors):`);
    remainingOrphans.forEach((r) => console.log(`  - "${r.name}" by ${r.author}`));
  }
}

main()
  .catch((e) => {
    console.error("❌ Script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

