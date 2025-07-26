
export const hasRole = (userRoles: string[], required: string) => {
    return userRoles.includes(required);
};

export const hasAnyRole = (userRoles: string[], rolesToCheck: string[]) => {
    return rolesToCheck.some(role => userRoles.includes(role));
};

export const can = (userPermissions: string[], permission: string) => {
    return userPermissions.includes(permission);
};
