// // //ib\api\auth-middleware.ts
// // import { NextApiRequest, NextApiResponse } from 'next';
// // import { getServerSession } from 'next-auth/next';
// // import { authOptions } from '@/lib/auth';

// // export type ApiResponse<T = any> = {
// //   success: boolean;
// //   message?: string;
// //   data?: T;
// //   errors?: any;
// // };

// // export type ApiHandler<T = any> = (
// //   req: NextApiRequest,
// //   res: NextApiResponse<ApiResponse<T>>,
// //   session: any
// // ) => Promise<void> | void;

// // export function withAuth(handler: ApiHandler) {
// //   return async (req: NextApiRequest, res: NextApiResponse) => {
// //     const session = await getServerSession(req, res, authOptions);

// //     if (!session) {
// //       return res.status(401).json({
// //         success: false,
// //         message: 'Unauthorized',
// //       });
// //     }

// //     return handler(req, res, session);
// //   };
// // }

// // export function withRoleAuth(handler: ApiHandler, allowedRoles: string[]) {
// //   return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
// //     if (!allowedRoles.includes(session.user.role)) {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Forbidden: Insufficient permissions',
// //       });
// //     }

// //     return handler(req, res, session);
// //   });
// // }

// // export function withPermissionAuth(handler: ApiHandler, requiredPermissions: string[]) {
// //   return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
// //     const userPermissions = session.user.permissions || [];
    
// //     const hasAllPermissions = requiredPermissions.every(permission => 
// //       userPermissions.includes(permission)
// //     );

// //     if (!hasAllPermissions) {
// //       return res.status(403).json({
// //         success: false,
// //         message: 'Forbidden: Insufficient permissions',
// //       });
// //     }

// //     return handler(req, res, session);
// //   });
// // }

// import { NextApiRequest, NextApiResponse } from 'next';
// // Use default import as suggested by TypeScript
// import getServerSession from 'next-auth';
// import { authOptions } from '@/lib/auth';

// export type ApiResponse<T = any> = {
//   success: boolean;
//   message?: string;
//   data?: T;
//   errors?: any;
// };

// export type ApiHandler<T = any> = (
//   req: NextApiRequest,
//   res: NextApiResponse<ApiResponse<T>>,
//   session: any
// ) => Promise<void> | void;

// export function withAuth(handler: ApiHandler) {
//   return async (req: NextApiRequest, res: NextApiResponse) => {
//     const session = await getServerSession(req, res, authOptions);

//     if (!session) {
//       return res.status(401).json({
//         success: false,
//         message: 'Unauthorized',
//       });
//     }

//     return handler(req, res, session);
//   };
// }

// export function withRoleAuth(handler: ApiHandler, allowedRoles: string[]) {
//   return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
//     if (!allowedRoles.includes(session.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Forbidden: Insufficient permissions',
//       });
//     }

//     return handler(req, res, session);
//   });
// }

// export function withPermissionAuth(handler: ApiHandler, requiredPermissions: string[]) {
//   return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
//     const userPermissions = session.user.permissions || [];
    
//     const hasAllPermissions = requiredPermissions.every(permission => 
//       userPermissions.includes(permission)
//     );

//     if (!hasAllPermissions) {
//       return res.status(403).json({
//         success: false,
//         message: 'Forbidden: Insufficient permissions',
//       });
//     }

//     return handler(req, res, session);
//   });
// }

import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
};

export type ApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<T>>,
  session: any
) => Promise<void> | void;

export function withAuth(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Updated to only pass the authOptions argument
    const session = await getServerSession(authOptions);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    return handler(req, res, session);
  };
}

export function withRoleAuth(handler: ApiHandler, allowedRoles: string[]) {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    if (!allowedRoles.includes(session.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
    }

    return handler(req, res, session);
  });
}

export function withPermissionAuth(handler: ApiHandler, requiredPermissions: string[]) {
  return withAuth(async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    const userPermissions = session.user.permissions || [];
    
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions',
      });
    }

    return handler(req, res, session);
  });
}