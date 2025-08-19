// These permission names are now 1-to-1 with your PRD's access matrix.
export const Permissions = {
  MANAGE_SYSTEM_SETTINGS: "manage_system_settings",
  ONBOARD_MANAGE_COMPANIES: "onboard_manage_companies",
  MANAGE_AGENT_STAFF: "manage_agent_staff",
  ASSIGN_MANAGE_COMPANY_STAFF: "assign_manage_company_staff",
  VIEW_ASSIGN_REQUESTS: "view_assign_requests",
  INITIATE_VERIFICATIONS: "initiate_verifications",
  VIEW_VERIFICATION_RESULTS: "view_verification_results",
  SUBSCRIPTION_MANAGEMENT: "subscription_management",
  VIEW_REPORTS_STATISTICS: "view_reports_statistics",
  // FINISH_VERIFICATION:"finish_verification",
  NONE: "none", // For public routes
};

export const routePermissions = [
  // --- ORDERED FROM MOST SPECIFIC TO LEAST SPECIFIC ---

  // System Settings (Super Admin only)
  { prefix: "/api/settings", permission: Permissions.MANAGE_SYSTEM_SETTINGS },
  { prefix: "/api/superadmin", permission: Permissions.MANAGE_SYSTEM_SETTINGS },

  // Company Management
  { prefix: "/api/companies/create", permission: Permissions.ONBOARD_MANAGE_COMPANIES },
  { prefix: "/api/companies/search", permission: Permissions.ONBOARD_MANAGE_COMPANIES },
  { prefix: "/api/companies/list", permission: Permissions.ONBOARD_MANAGE_COMPANIES },
  { prefix: "/api/companies", permission: Permissions.ONBOARD_MANAGE_COMPANIES },

  // Staff Management
  { prefix: "/api/company-employees", permission: Permissions.ASSIGN_MANAGE_COMPANY_STAFF },
  { prefix: "/api/import-employees", permission: Permissions.ASSIGN_MANAGE_COMPANY_STAFF },
  { prefix: "/api/roles", permission: Permissions.ASSIGN_MANAGE_COMPANY_STAFF },
  
  // Verification Flow
  { prefix: "/api/experience/verify", permission: Permissions.VIEW_ASSIGN_REQUESTS },
  // { prefix: "/api/review", permission: Permissions.VIEW_ASSIGN_REQUESTS },
  // { prefix: "/api/experience/add", permission: Permissions.INITIATE_VERIFICATIONS },
  { prefix: "/api/submit-verification", permission: Permissions.INITIATE_VERIFICATIONS },
  { prefix: "/api/request-hr-email", permission: Permissions.INITIATE_VERIFICATIONS },

  // Finish Verification
  // { prefix: "/api/send-verification", permission: Permissions.FINISH_VERIFICATION },


  // Viewing Data
  { prefix: "/api/profile", permission: Permissions.VIEW_VERIFICATION_RESULTS },
  { prefix: "/api/dashboard", permission: Permissions.VIEW_REPORTS_STATISTICS },
  { prefix: "/api/employees", permission: Permissions.VIEW_VERIFICATION_RESULTS },

  
  // Subscription
  { prefix: "/api/packages", permission: Permissions.SUBSCRIPTION_MANAGEMENT },
  { prefix: "/api/subscribe", permission: Permissions.SUBSCRIPTION_MANAGEMENT },

  // Public Auth Routes
  { prefix: "/api/auth", permission: Permissions.NONE },
];
