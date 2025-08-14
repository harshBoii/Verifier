// // import { NextResponse } from 'next/server';
// // import prisma from '@/app/lib/prisma';
// // import * as jose from 'jose';
// // import { Permissions } from '@/app/lib/route-permission';

// // // This object is a direct translation of your PRD's access matrix
// // const rolePermissions = {
// //     SUPER_ADMIN: ["*"],
// //     AGENT: [
// //         Permissions.ONBOARD_MANAGE_COMPANIES,
// //         Permissions.MANAGE_AGENT_STAFF,
// //         Permissions.VIEW_ASSIGN_REQUESTS,
// //         Permissions.INITIATE_VERIFICATIONS,
// //         Permissions.VIEW_VERIFICATION_RESULTS,
// //         Permissions.VIEW_REPORTS_STATISTICS,
// //     ],
// //     AGENT_STAFF: [
// //         Permissions.VIEW_ASSIGN_REQUESTS,
// //         Permissions.INITIATE_VERIFICATIONS,
// //         Permissions.VIEW_VERIFICATION_RESULTS,
// //     ],
// //     ADMIN: [
// //       Permissions.ASSIGN_MANAGE_COMPANY_STAFF,
// //       Permissions.VIEW_ASSIGN_REQUESTS,
// //       Permissions.INITIATE_VERIFICATIONS,
// //       Permissions.VIEW_VERIFICATION_RESULTS,
// //       Permissions.SUBSCRIPTION_MANAGEMENT,
// //       Permissions.VIEW_REPORTS_STATISTICS,
// //     ],
// //     EMPLOYEE: [
// //       Permissions.VIEW_ASSIGN_REQUESTS,
// //       Permissions.INITIATE_VERIFICATIONS,
// //       Permissions.VIEW_VERIFICATION_RESULTS,
// //     ],
// //   };


  
// // export async function POST(request) {
// //   console.log("ROLE PERMISSSION IS ",rolePermissions)
// //   try {
// //     const { permissionNeeded } = await request.json();
// //     const token = request.cookies.get('token')?.value;

// //     if (!token) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// //     const { payload } = await jose.jwtVerify(token, secret);

// //     if (!payload || !payload.userId) {
// //       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
// //     }

// //     const user = await prisma.user.findUnique({
// //       where: { id: payload.userId },
// //       include: {
// //         roles: {
// //           include: {
// //             role: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!user || user.roles.length === 0) {
// //       return NextResponse.json({ error: 'Forbidden: No roles assigned' }, { status: 403 });
// //     }

// //     const userRoleNames = user.roles.map(userRole => userRole.role.name);

// //     const hasPermission = userRoleNames.some(roleName => {
// //         const allowed = rolePermissions[roleName] || [];
// //         return allowed.includes("*") || allowed.includes(permissionNeeded);
// //     });

// //     if (!hasPermission) {
// //       return NextResponse.json({ error: 'Forbidden: You do not have permission' }, { status: 403 });
// //     }

// //     // If all checks pass, return a success response
// //     return NextResponse.json({ message: 'Permission granted' });

// //   } catch (error) {
// //     console.error("Permission Check API Error:", error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }

// // import { NextResponse } from 'next/server';
// // import prisma from '@/app/lib/prisma';
// // import * as jose from 'jose';
// // import { Permissions } from '@/app/lib/route-permission';
// // /**
// //  * A helper function to fetch permissions from the DB and format them
// //  * into the structure our logic expects.
// //  */
// // async function getRolePermissionsFromDB() {
// //     const permissionsFromDb = await prisma.rolePermission.findMany();
    
// //     const allPermissionKeys = {
// //         accessCompanies: Permissions.ONBOARD_MANAGE_COMPANIES,
// //         packages: Permissions.SUBSCRIPTION_MANAGEMENT,
// //         supportTeam: Permissions.MANAGE_AGENT_STAFF,
// //         searchLogin: Permissions.VIEW_ASSIGN_REQUESTS,
// //     };

// //     const rolePermissions = {};

// //     permissionsFromDb.forEach(p => {
// //         const allowed = [];
// //         for (const [key, permission] of Object.entries(allPermissionKeys)) {
// //             if (p[key]) {
// //                 allowed.push(permission);
// //             }
// //         }
        
// //         // Handle Super Admin separately as a special case
// //         if (p.roleName === 'SUPER_ADMIN') {
// //             rolePermissions[p.roleName] = ['*'];
// //         } else {
// //             rolePermissions[p.roleName] = allowed;
// //         }
// //     });

// //     return rolePermissions;
// // }


// // export async function POST(request) {
// //   const Rp= await getRolePermissionsFromDB()
// //   console.log(Rp)
// //   try {
// //     const { permissionNeeded } = await request.json();
// //     const token = request.cookies.get('token')?.value;

// //     if (!token) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //     }

// //     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
// //     const { payload } = await jose.jwtVerify(token, secret);

// //     if (!payload || !payload.userId) {
// //       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
// //     }

// //     // --- THIS IS THE NEW LOGIC ---
// //     // 1. Fetch the live permission rules from the database.
// //     const rolePermissions = await getRolePermissionsFromDB();
// //     // --- END OF NEW LOGIC ---

// //     const user = await prisma.user.findUnique({
// //       where: { id: payload.userId },
// //       include: {
// //         roles: {
// //           include: {
// //             role: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!user || user.roles.length === 0) {
// //       return NextResponse.json({ error: 'Forbidden: No roles assigned' }, { status: 403 });
// //     }

// //     const userRoleNames = user.roles.map(userRole => userRole.role.name);

// //     const hasPermission = userRoleNames.some(roleName => {
// //         const allowed = rolePermissions[roleName] || [];
// //         return allowed.includes("*") || allowed.includes(permissionNeeded);
// //     });

// //     if (!hasPermission) {
// //       return NextResponse.json({ error: 'Forbidden: You do not have permission' }, { status: 403 });
// //     }

// //     return NextResponse.json({ message: 'Permission granted' });

// //   } catch (error) {
// //     console.error("Permission Check API Error:", error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import prisma from '@/app/lib/prisma';
// import * as jose from 'jose';
// import { Permissions } from '@/app/lib/route-permission';

// /**
//  * A helper function to fetch permissions from the DB and format them
//  * into the structure our logic expects.
//  */
// async function getRolePermissionsFromDB() {
//     const permissionsFromDb = await prisma.rolePermission.findMany();
    
//     // This mapping object correctly includes all boolean fields from your RolePermission model.
//     const allPermissionKeys = {
//         manageSystemSettings: Permissions.MANAGE_SYSTEM_SETTINGS,
//         accessCompanies: Permissions.ONBOARD_MANAGE_COMPANIES,
//         manageAgentStaff: Permissions.MANAGE_AGENT_STAFF,
//         assignManageCompanyStaff: Permissions.ASSIGN_MANAGE_COMPANY_STAFF,
//         viewAssignRequests: Permissions.VIEW_ASSIGN_REQUESTS,
//         initiateVerifications: Permissions.INITIATE_VERIFICATIONS,
//         viewVerificationResults: Permissions.VIEW_VERIFICATION_RESULTS,
//         packages: Permissions.SUBSCRIPTION_MANAGEMENT,
//         viewReportsStatistics: Permissions.VIEW_REPORTS_STATISTICS,
//         supportTeam: Permissions.MANAGE_AGENT_STAFF, 
//         searchLogin: Permissions.VIEW_ASSIGN_REQUESTS,
//     };

//     const rolePermissions = {};

//     permissionsFromDb.forEach(p => {
//         const allowed = [];
//         // Loop through the complete mapping to build the permission list
//         for (const [key, permission] of Object.entries(allPermissionKeys)) {
//             if (p[key]) {
//                 allowed.push(permission);
//             }
//         }
        
//         if (p.roleName === 'SUPER_ADMIN') {
//             rolePermissions[p.roleName] = ['*'];
//         } else {
//             // Use a Set to ensure permissions are unique, then convert back to an array
//             rolePermissions[p.roleName] = [...new Set(allowed)];
//         }
//     });

//     return rolePermissions;
// }


// export async function POST(request) {
//   const rp = await getRolePermissionsFromDB()
//   console.log(rp)
//   try {
//     const { permissionNeeded } = await request.json();
//     const token = request.cookies.get('token')?.value;

//     if (!token) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//     const { payload } = await jose.jwtVerify(token, secret);

//     if (!payload || !payload.userId) {
//       return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
//     }

//     // --- THIS IS THE FIX ---
//     // 1. Fetch the live permission rules from the database instead of using a hardcoded object.
//     const rolePermissions = await getRolePermissionsFromDB();
//     // --- END OF FIX ---

//     const user = await prisma.user.findUnique({
//       where: { id: payload.userId },
//       include: {
//         roles: {
//           include: {
//             role: true,
//           },
//         },
//       },
//     });

//     if (!user || user.roles.length === 0) {
//       return NextResponse.json({ error: 'Forbidden: No roles assigned' }, { status: 403 });
//     }

//     const userRoleNames = user.roles.map(userRole => userRole.role.name);

//     const hasPermission = userRoleNames.some(roleName => {
//         const allowed = rolePermissions[roleName] || [];
//         return allowed.includes("*") || allowed.includes(permissionNeeded);
//     });

//     if (!hasPermission) {
//       return NextResponse.json({ error: 'Forbidden: You do not have permission' }, { status: 403 });
//     }

//     return NextResponse.json({ message: 'Permission granted' });

//   } catch (error) {
//     console.error("Permission Check API Error:", error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as jose from 'jose';
import { Permissions } from '@/app/lib/route-permission';

/**
 * A helper function to fetch permissions from the DB and format them.
 */
async function getRolePermissionsFromDB() {
    const permissionsFromDb = await prisma.rolePermission.findMany();
    
    const allPermissionKeys = {
        manageSystemSettings: Permissions.MANAGE_SYSTEM_SETTINGS,
        accessCompanies: Permissions.ONBOARD_MANAGE_COMPANIES,
        manageAgentStaff: Permissions.MANAGE_AGENT_STAFF,
        assignManageCompanyStaff: Permissions.ASSIGN_MANAGE_COMPANY_STAFF,
        viewAssignRequests: Permissions.VIEW_ASSIGN_REQUESTS,
        initiateVerifications: Permissions.INITIATE_VERIFICATIONS,
        viewVerificationResults: Permissions.VIEW_VERIFICATION_RESULTS,
        packages: Permissions.SUBSCRIPTION_MANAGEMENT,
        viewReportsStatistics: Permissions.VIEW_REPORTS_STATISTICS,
        supportTeam: Permissions.MANAGE_AGENT_STAFF, 
        searchLogin: Permissions.VIEW_ASSIGN_REQUESTS,
    };

    const rolePermissions = {};

    permissionsFromDb.forEach(p => {
        const allowed = [];
        for (const [key, permission] of Object.entries(allPermissionKeys)) {
            if (p[key]) {
                allowed.push(permission);
            }
        }
        
        if (p.roleName === 'SUPER_ADMIN') {
            rolePermissions[p.roleName] = ['*'];
        } else {
            rolePermissions[p.roleName] = [...new Set(allowed)];
        }
    });

    return rolePermissions;
}


export async function POST(request) {
  try {
    const { permissionNeeded } = await request.json();
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const rolePermissions = await getRolePermissionsFromDB();

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.roles.length === 0) {
      return NextResponse.json({ error: 'Forbidden: No roles assigned' }, { status: 403 });
    }

    const userRoleNames = user.roles.map(userRole => userRole.role.name);

    const hasPermission = userRoleNames.some(roleName => {
        const allowed = rolePermissions[roleName] || [];
        return allowed.includes("*") || allowed.includes(permissionNeeded);
    });

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission' }, { status: 403 });
    }

    // --- NEW: SUBSCRIPTION CHECK ---
    // If the user is not a Super Admin, check their company's subscription status.
    const isSuperAdmin = userRoleNames.includes('SUPER_ADMIN');
    if (!isSuperAdmin) {
        const subscription = await prisma.subscription.findUnique({
            where: { companyId: user.companyId },
        });

        // If no subscription exists, or it's inactive, or the period has ended, deny access.
        if (!subscription || !subscription.isActive || new Date() > new Date(subscription.currentPeriodEnds)) {
            return NextResponse.json({ error: 'Forbidden: Your company does not have an active subscription.' }, { status: 403 });
        }
    }
    // --- END OF SUBSCRIPTION CHECK ---

    return NextResponse.json({ message: 'Permission granted' });

  } catch (error) {
    console.error("Permission Check API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
