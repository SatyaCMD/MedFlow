import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import { Permission, ROLE_PERMISSIONS } from '@medicore360/shared';

export const authorize = (requiredPermission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError('Authentication context missing.', 401, 'UNAUTHORIZED'));
      }

      const userPermissions = ROLE_PERMISSIONS[user.role] || [];
      const isAuthorized = userPermissions.includes(requiredPermission);

      if (!isAuthorized) {
        return next(new AppError('Forbidden: Insufficient privileges.', 403, 'FORBIDDEN'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
