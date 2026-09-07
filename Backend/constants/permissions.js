export const PERMISSIONS = {
  /* ==========================================
     PAGES
  ========================================== */

  PAGES_VIEW: "pages.view",
  PAGES_CREATE: "pages.create",
  PAGES_EDIT: "pages.edit",
  PAGES_DELETE: "pages.delete",
  PAGES_PUBLISH: "pages.publish",


  /* ==========================================
     NOTICES
  ========================================== */

  NOTICES_VIEW: "notices.view",
  NOTICES_CREATE: "notices.create",
  NOTICES_EDIT: "notices.edit",
  NOTICES_DELETE: "notices.delete",


  /* ==========================================
     EVENTS
  ========================================== */

  EVENTS_VIEW: "events.view",
  EVENTS_CREATE: "events.create",
  EVENTS_EDIT: "events.edit",
  EVENTS_DELETE: "events.delete",


  /* ==========================================
     MEDIA
  ========================================== */

  MEDIA_VIEW: "media.view",
  MEDIA_UPLOAD: "media.upload",
  MEDIA_EDIT: "media.edit",
  MEDIA_DELETE: "media.delete",


  /* ==========================================
     NAVIGATION
  ========================================== */

  NAVIGATION_VIEW: "navigation.view",
  NAVIGATION_EDIT: "navigation.edit",


  /* ==========================================
     USERS
  ========================================== */

  USERS_VIEW: "users.view",
  USERS_CREATE: "users.create",
  USERS_EDIT: "users.edit",
  USERS_DELETE: "users.delete",


  /* ==========================================
     ROLES
  ========================================== */

  ROLES_VIEW: "roles.view",
  ROLES_CREATE: "roles.create",
  ROLES_EDIT: "roles.edit",
  ROLES_DELETE: "roles.delete",


  /* ==========================================
     APPROVALS
  ========================================== */

  APPROVALS_VIEW: "approvals.view",
  APPROVALS_SUBMIT: "approvals.submit",
  APPROVALS_APPROVE: "approvals.approve",
  APPROVALS_REJECT: "approvals.reject",


  /* ==========================================
     AUDIT LOG
  ========================================== */

  AUDIT_VIEW: "audit.view",


  /* ==========================================
     SETTINGS
  ========================================== */

  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",


  /* ==========================================
     LINK MANAGER
  ========================================== */

  LINK_MANAGER_VIEW: "link_manager.view",
  LINK_MANAGER_CREATE: "link_manager.create",
  LINK_MANAGER_EDIT: "link_manager.edit",
  LINK_MANAGER_DELETE: "link_manager.delete",


  /* ==========================================
     ORGANOGRAM
  ========================================== */

  ORGANOGRAM_VIEW: "organogram.view",
  ORGANOGRAM_CREATE: "organogram.create",
  ORGANOGRAM_EDIT: "organogram.edit",
  ORGANOGRAM_DELETE: "organogram.delete",


  /* ==========================================
     DASHBOARD
  ========================================== */

  DASHBOARD_VIEW: "dashboard.view",
};

export const PERMISSION_GROUPS = [
  {
    key: "pages",
    label: "Pages",
    permissions: [
      {
        key: PERMISSIONS.PAGES_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.PAGES_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.PAGES_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.PAGES_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "notices",
    label: "Notices",
    permissions: [
      {
        key: PERMISSIONS.NOTICES_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.NOTICES_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.NOTICES_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.NOTICES_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "events",
    label: "Events",
    permissions: [
      {
        key: PERMISSIONS.EVENTS_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.EVENTS_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.EVENTS_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.EVENTS_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "media",
    label: "Media",
    permissions: [
      {
        key: PERMISSIONS.MEDIA_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.MEDIA_UPLOAD,
        label: "Upload",
      },
      {
        key: PERMISSIONS.MEDIA_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.MEDIA_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "navigation",
    label: "Navigation",
    permissions: [
      {
        key: PERMISSIONS.NAVIGATION_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.NAVIGATION_EDIT,
        label: "Edit",
      },
    ],
  },

  {
    key: "users",
    label: "Users",
    permissions: [
      {
        key: PERMISSIONS.USERS_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.USERS_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.USERS_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.USERS_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "roles",
    label: "Roles",
    permissions: [
      {
        key: PERMISSIONS.ROLES_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.ROLES_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.ROLES_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.ROLES_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "approvals",
    label: "Approvals",
    permissions: [
      {
        key: PERMISSIONS.APPROVALS_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.APPROVALS_SUBMIT,
        label: "Submit",
      },
      {
        key: PERMISSIONS.APPROVALS_APPROVE,
        label: "Approve",
      },
      {
        key: PERMISSIONS.APPROVALS_REJECT,
        label: "Reject",
      },
    ],
  },

  {
    key: "audit",
    label: "Audit Logs",
    permissions: [
      {
        key: PERMISSIONS.AUDIT_VIEW,
        label: "View",
      },
    ],
  },

  {
    key: "settings",
    label: "Settings",
    permissions: [
      {
        key: PERMISSIONS.SETTINGS_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.SETTINGS_EDIT,
        label: "Edit",
      },
    ],
  },

  {
    key: "link_manager",
    label: "Link Manager",
    permissions: [
      {
        key: PERMISSIONS.LINK_MANAGER_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.LINK_MANAGER_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.LINK_MANAGER_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.LINK_MANAGER_DELETE,
        label: "Delete",
      },
    ],
  },

  {
    key: "organogram",
    label: "Organogram",
    permissions: [
      {
        key: PERMISSIONS.ORGANOGRAM_VIEW,
        label: "View",
      },
      {
        key: PERMISSIONS.ORGANOGRAM_CREATE,
        label: "Create",
      },
      {
        key: PERMISSIONS.ORGANOGRAM_EDIT,
        label: "Edit",
      },
      {
        key: PERMISSIONS.ORGANOGRAM_DELETE,
        label: "Delete",
      },
    ],
  },
];