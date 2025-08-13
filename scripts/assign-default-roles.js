const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * This script finds all users who do not have an 'EMPLOYEE' role
 * and assigns it to them within their respective company.
 */
async function main() {
  console.log('🚀 Starting role assignment script...');

    await prisma.role.createMany({
    data: [
      { name: 'SUPER_ADMIN' },
      { name: 'ADMIN' },
      { name: 'EMPLOYEE' },
      { name: 'COMPANY' },
      // Add other roles from your PRD like AGENT, AGENT_STAFF if they are in your enum
    ],
    skipDuplicates: true, // This prevents errors if you re-run the seed
  });


  // 1. Find the ID for the 'EMPLOYEE' role from the Role table.
  const employeeRole = await prisma.role.findUnique({
    where: { name: 'EMPLOYEE' },
  });
  

  if (!employeeRole) {
    console.error("❌ Error: Default 'EMPLOYEE' role not found. Please seed the Role table first.");
    return;
  }
  console.log(`✅ Found 'EMPLOYEE' role with ID: ${employeeRole.id}`);

  // 2. Find all users who do NOT currently have the 'EMPLOYEE' role.
  // This prevents creating duplicate role assignments if the script is run multiple times.
  const usersWithoutEmployeeRole = await prisma.user.findMany({
    where: {
      roles: {
        none: {
          roleId: employeeRole.id,
        },
      },
    },
  });

  if (usersWithoutEmployeeRole.length === 0) {
    console.log('✅ All users already have the EMPLOYEE role. No action needed.');
    return;
  }

  console.log(`👥 Found ${usersWithoutEmployeeRole.length} users needing the EMPLOYEE role. Assigning now...`);

  // 3. Prepare the data for the new role assignments.
  const roleAssignments = usersWithoutEmployeeRole.map(user => ({
    userId: user.id,
    roleId: employeeRole.id,
    companyId: user.companyId, // Assign the role within the user's company
  }));

  // 4. Create all the new role assignments in a single, efficient query.
  const result = await prisma.userRole.createMany({
    data: roleAssignments,
  });

  console.log(`✅ Successfully assigned the 'EMPLOYEE' role to ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🏁 Script finished.');
  });
