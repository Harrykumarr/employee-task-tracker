// Authorization utilities for role-based access control

export const isAdmin = (userRole) => {
  return userRole === 'Admin';
};

export const isUser = (userRole) => {
  return userRole === 'User';
};

export const canEditEmployee = (userRole) => {
  return isAdmin(userRole);
};

export const canDeleteEmployee = (userRole) => {
  return isAdmin(userRole);
};

export const canCreateTask = (userRole) => {
  return isAdmin(userRole);
};

export const canDeleteTask = (userRole) => {
  return isAdmin(userRole);
};

export const canViewAllTasks = (userRole) => {
  return isAdmin(userRole);
};

export const canViewOwnTasks = (userRole) => {
  return true; // Both admin and user can view their own tasks
};
