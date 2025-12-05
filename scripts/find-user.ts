import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  
  console.log("Utilisateurs dans la base de données:");
  users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

