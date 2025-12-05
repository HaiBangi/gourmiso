import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.recipe.count();
  console.log("Nombre de recettes:", count);
  
  const recipes = await prisma.recipe.findMany({
    select: { id: true, name: true, userId: true }
  });
  
  recipes.forEach(r => console.log(`ID: ${r.id}, Name: ${r.name}, UserId: ${r.userId}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

