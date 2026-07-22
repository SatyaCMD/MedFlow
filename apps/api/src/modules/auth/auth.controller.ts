/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
  private service = new AuthService();

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const defaultHospitalId = 'HOSP-001';
      const user = await this.service.registerUser(req.body, defaultHospitalId);
      res.status(201).json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.service.login(email, password);
      
      if (result.requiresOtp) {
        res.status(200).json({
          success: true,
          data: {
            requiresOtp: true,
            tempToken: result.tempToken,
          },
        });
        return;
      }

      // Secure login fallback
      res.cookie('refreshToken', (result as any).refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: (result as any).accessToken,
          user: (result as any).user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tempToken, code } = req.body;
      const result = await this.service.verifyOtp(tempToken, code);
      
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  getDebugOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tempToken = (req.query.tempToken as string) || '';
      const debugData = await this.service.getDebugOtp(tempToken);
      res.status(200).json({ success: true, data: debugData });
    } catch (err) {
      next(err);
    }
  };


  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ success: false, message: 'Refresh token missing' });
        return;
      }

      const result = await this.service.refresh(refreshToken);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      await this.service.logout(user.userId, user.sessionId);
      res.clearCookie('refreshToken');
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.userId,
            role: user.role,
            hospitalId: user.hospitalId,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  };
}

