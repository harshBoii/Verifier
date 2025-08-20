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
    // Destructure `permissionNeeded` and the new `apiRoute` from the body
    const { permissionNeeded, apiRoute } = await request.json();
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
        roles: { include: { role: true } },
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

    // --- ENHANCED SUBSCRIPTION & FEATURE CHECK ---
    const isSuperAdmin = userRoleNames.includes('SUPER_ADMIN');
    if (!isSuperAdmin && user.companyId) {
        const subscription = await prisma.subscription.findUnique({
            where: { companyId: user.companyId },
            include: {
                plan: {
                    include: {
                        planFeatures: {
                            include: { feature: true }
                        }
                    }
                },
            }
        });

        // 1. Check for a valid, active subscription
        if (!subscription || !subscription.isActive || new Date() > new Date(subscription.currentPeriodEnds)) {
            return NextResponse.json({ error: 'Forbidden: Your company does not have an active subscription.' }, { status: 403 });
        }

        // 2. Check for feature-specific permissions based on the API route being accessed
        if (apiRoute) {
            const subscribedFeatures = subscription.plan.planFeatures.map(pf => pf.feature.name.toLowerCase());
            
            // Rule: Check for SMTP features
            const requiresSmtp = /smtp/i.test(apiRoute);
            const hasSmtp = subscribedFeatures.some(name => /smtp/i.test(name));
            if (requiresSmtp && !hasSmtp) {
                return NextResponse.json({ error: 'Forbidden: Your plan does not include SMTP features.' }, { status: 403 });
            }

            // Rule: Check for Advanced Chart/Report features
            const requiresReports = /reports/i.test(apiRoute);
            const hasAdvancedCharts = subscribedFeatures.some(name => /advanced|report/i.test(name));
            if (requiresReports && !hasAdvancedCharts) {
                return NextResponse.json({ error: 'Forbidden: Your plan does not include access to advanced reports.' }, { status: 403 });
            }
            const verificationUsed=/send-verification/.test(apiRoute)
            if(verificationUsed){
            if (!subscription || subscription.verifications_left <= 0) {
                return NextResponse.json({ error: 'Forbidden: No verification credits remaining.' }, { status: 403 });
            }
                await prisma.subscription.update({
                  where:{id:user.companyId},
                  data:{verifications_left:{
                    decrement:1
                  }}
                })
            }
        }
    }
    // --- END OF ENHANCED CHECK ---

    return NextResponse.json({ message: 'Permission granted' });

  } catch (error) {
    console.error("Permission Check API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
