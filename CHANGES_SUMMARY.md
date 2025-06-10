# Summary of Changes

This set of changes implements a hierarchical structure (HQ, Center, Cluster, Small Group) within the application and enhances social media tracking capabilities. 

Key modifications include:

1.  **Models Updated/Created:**
    *   `Center.ts`: New model for managing Centers.
    *   `Cluster.ts`: Updated to link to `Center` and manage clusters within a center.
    *   `SmallGroup.ts`: Updated to link to `Cluster` and `Center`.
    *   `Member.ts`: Updated with `centerId`, `clusterId`, `smallGroupId` and compound unique indexes scoped by `centerId`.
    *   `User.ts`: Updated with `assignedRoles` array to support multi-scope role assignments (e.g., GLOBAL_ADMIN, CENTER_ADMIN for a specific centerId).
    *   `Event.ts`: Updated with `scope` (HQ/CENTER) and `centerId`.
    *   `DiscipleshipGoal.ts`: Updated with `level` (HQ/CENTER/CLUSTER/SMALL_GROUP/INDIVIDUAL) and corresponding scope IDs (`centerId`, `clusterId`, `smallGroupId`, `memberId`).
    *   `Notification.ts`: Updated with `targetLevel`, `targetId`, and `originatorCenterId` for scoped notifications.
    *   `SocialMediaAccount.ts`: Updated with `scope` (HQ/CENTER) and `centerId` for scoped social media accounts.

2.  **Services Updated/Created:**
    *   `centerService.ts`: New service for CRUD operations on Centers.
    *   `clusterService.ts`: Updated to handle `centerId` and scoped operations.
    *   `smallGroupService.ts`: Updated to handle `clusterId`, `centerId`, and scoped operations.
    *   `memberService.ts`: Updated for CRUD operations considering `centerId` and other hierarchical scopes, including uniqueness checks within centers.
    *   `socialMediaService.ts`: Updated for CRUD operations on social media accounts, now scoped to HQ or Center. Includes follower update and history logic.
    *   `eventService.ts`: Updated for CRUD operations on events, scoped to HQ or Center.
    *   `discipleshipGoalService.ts`: Updated for CRUD operations on goals, scoped to various hierarchical levels.
    *   `notificationService.ts`: Updated to handle creation and retrieval of scoped notifications.

3.  **API Routes Updated/Created:**
    *   `/api/centers/**`: New routes for Center CRUD operations with GLOBAL_ADMIN and CENTER_ADMIN permission checks.
    *   `/api/clusters/**`: Updated routes for Cluster CRUD, scoped by Center, with relevant permission checks (GLOBAL_ADMIN, CENTER_ADMIN, CLUSTER_LEADER).
    *   `/api/small-groups/**`: Updated routes for Small Group CRUD, scoped by Cluster/Center, with relevant permission checks.
    *   `/api/members/**`: Updated routes for Member CRUD, scoped by Center/Cluster/Small Group, with relevant permission checks.
    *   `/api/social-media/accounts/**`: Updated routes for Social Media Account CRUD, scoped by HQ/Center, with permission checks. Includes routes for follower updates and history (conceptualized).
    *   `/api/events/**`: Updated routes for Event CRUD, scoped by HQ/Center, with permission checks.
    *   `/api/discipleship-goals/**`: Updated routes for Discipleship Goal CRUD, scoped by various hierarchical levels, with permission checks.
    *   `/api/notifications/**`: Updated routes for Notification creation and retrieval, with complex scoping based on user roles and assignments.

4.  **Authentication and Permissions:**
    *   `auth.ts` & `auth-config.ts`: Updated to use the new `User` model with `assignedRoles` for session and JWT population.
    *   `permissions.ts`: New utility created (`checkPermission`) to verify user roles against required roles and scopes (centerId, clusterId, smallGroupId).
    *   All relevant API routes now use `checkPermission` for robust authorization based on the new hierarchical roles.

5.  **Social Media Tracking:**
    *   The `SocialMediaAccount` model and service now support HQ-level and Center-level accounts.
    *   APIs allow for managing these scoped accounts.
    *   Follower count updates and history are part of the service layer, with conceptual API endpoints for triggering updates and fetching history.

**Overall Impact:**
The application now supports a multi-level organizational structure, allowing for data to be managed and accessed according to defined roles and their respective scopes within the hierarchy. This provides better organization, data segregation, and role-based access control. Social media tracking is also integrated into this hierarchical model.

