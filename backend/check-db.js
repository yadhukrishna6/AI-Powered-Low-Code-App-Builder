const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: { workflows: true, forms: true }
  });
  console.log('--- PROJECTS ---');
  console.log(JSON.stringify(projects, null, 2));

  const orphanWorkflows = await prisma.workflow.findMany({
    where: { projectId: null }
  });
  console.log('--- ORPHAN WORKFLOWS ---');
  console.log(JSON.stringify(orphanWorkflows, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
