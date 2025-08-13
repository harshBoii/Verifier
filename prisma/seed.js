const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Define the permission names to match the object keys
const Permissions = {
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  ONBOARD_MANAGE_COMPANIES: "onboard_manage_companies",
  MANAGE_AGENT_STAFF: "manage_agent_staff",
  ASSIGN_MANAGE_COMPANY_STAFF: "assign_manage_company_staff",
  VIEW_ASSIGN_REQUESTS: "view_assign_requests",
  INITIATE_VERIFICATIONS: "initiate_verifications",
  VIEW_VERIFICATION_RESULTS: "view_verification_results",
  SUBSCRIPTION_MANAGEMENT: "subscription_management",
  VIEW_REPORTS_STATISTICS: "view_reports_statistics",
};

// This object defines the permissions for each role, as per your PRD
const rolePermissionsConfig = {
    SUPER_ADMIN: ["*"],
    AGENT: [
        Permissions.ONBOARD_MANAGE_COMPANIES,
        Permissions.MANAGE_AGENT_STAFF,
        Permissions.VIEW_ASSIGN_REQUESTS,
        Permissions.INITIATE_VERIFICATIONS,
        Permissions.VIEW_VERIFICATION_RESULTS,
        Permissions.VIEW_REPORTS_STATISTICS,
    ],
    AGENT_STAFF: [
        Permissions.VIEW_ASSIGN_REQUESTS,
        Permissions.INITIATE_VERIFICATIONS,
        Permissions.VIEW_VERIFICATION_RESULTS,
    ],
    ADMIN: [
      Permissions.ASSIGN_MANAGE_COMPANY_STAFF,
      Permissions.VIEW_ASSIGN_REQUESTS,
      Permissions.INITIATE_VERIFICATIONS,
      Permissions.VIEW_VERIFICATION_RESULTS,
      Permissions.SUBSCRIPTION_MANAGEMENT,
      Permissions.VIEW_REPORTS_STATISTICS,
    ],
    EMPLOYEE: [
      Permissions.VIEW_ASSIGN_REQUESTS,
      Permissions.INITIATE_VERIFICATIONS,
      Permissions.VIEW_VERIFICATION_RESULTS,
    ],
};

// Helper function to convert the config into the database format
const generatePermissionData = () => {
    const allPermissionKeys = {
        accessCompanies: Permissions.ONBOARD_MANAGE_COMPANIES,
        packages: Permissions.SUBSCRIPTION_MANAGEMENT,
        supportTeam: Permissions.MANAGE_AGENT_STAFF, // Mapping this to a relevant permission
        searchLogin: Permissions.VIEW_ASSIGN_REQUESTS, // Mapping this to a relevant permission
    };

    return Object.entries(rolePermissionsConfig).map(([roleName, allowedPermissions]) => {
        const permissions = {
            roleName: roleName,
            accessCompanies: false,
            packages: false,
            supportTeam: false,
            searchLogin: false,
        };

        if (allowedPermissions.includes("*")) {
            // Super Admin gets all permissions
            Object.keys(allPermissionKeys).forEach(key => permissions[key] = true);
        } else {
            // Set permissions based on the config
            for (const [key, permission] of Object.entries(allPermissionKeys)) {
                if (allowedPermissions.includes(permission)) {
                    permissions[key] = true;
                }
            }
        }
        return permissions;
    });
};


async function main() {
  console.log('🌱 Start seeding roles and permissions...');

  // 1. Clean up existing role-related data
  await prisma.rolePermission.deleteMany();

  console.log('✅ Existing roles and permissions deleted.');

  // 2. Seed the master Role table
  const rolesToCreate = Object.keys(rolePermissionsConfig);
  await prisma.role.createMany({
    data: rolesToCreate.map(name => ({ name })),
    skipDuplicates: true,
  });
  console.log(`✅ Created master roles: ${rolesToCreate.join(', ')}`);

  // 3. Generate and seed the RolePermission table
  const permissionData = generatePermissionData();
  await prisma.rolePermission.createMany({
    data: permissionData,
  });
  console.log('✅ Default permissions for each role have been seeded.');

  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
