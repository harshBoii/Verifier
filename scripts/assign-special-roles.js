const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * This script finds all users who do not have an 'EMPLOYEE' role
 * and assigns it to them within their respective company.
 */
async function main() {
  console.log('🚀 Starting role assignment script...');

  const AdminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });
  
  console.log(`✅ Found 'ADMIN' role with ID: ${AdminRole.id}`);

  // 2. Find all users who do NOT currently have the 'EMPLOYEE' role.
  // This prevents creating duplicate role assignments if the script is run multiple times.
  const user= await prisma.user.findUnique({
    where: {
      email:'h.rvardhan3@gmail.com' 
    },
  });

  console.log(`Role 'SUPERADMIN' assigning to ${user.email}`)

  await prisma.userRole.updateMany({
    where:{
        userId:user.id
    },
    data:{
        roleId:AdminRole.id
    }
  })

  console.log(`🎉 Role 'SUPERADMIN' assigned to ${user.email}`);

}

main()