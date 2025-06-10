# Project Documentation

## 1. Project Structure and Architecture

This project is a Church Management System built with Next.js, a popular React framework for building server-side rendered and static web applications. It uses MongoDB as its primary database.

### Key Technologies:

*   **Next.js:** Frontend and backend framework.
*   **React:** UI library.
*   **TypeScript:** For static typing.
*   **MongoDB:** NoSQL database for storing application data.
*   **Mongoose:** ODM library for MongoDB.
*   **NextAuth.js:** For authentication.
*   **Tailwind CSS:** For styling.
*   **Shadcn/ui:** UI component library.
*   **Redis:** In-memory data store, used for background job queueing.
*   **Cloudinary:** For image hosting and management.

### Folder Structure:

The project follows a typical Next.js project structure with some additions:

*   **`app/`**: Contains the core application code, including:
    *   **`(auth)/`**: Authentication-related pages (login, register, forgot password).
    *   **`(dashboard)/`**: Pages accessible after logging in, representing the main features of the application.
    *   **`api/`**: API route handlers for backend logic.
    *   **`layout.tsx`**: The main layout component for the application.
    *   **`page.tsx`**: The landing page of the application.
*   **`auth/`**: Contains authentication configuration files.
*   **`components/`**: Reusable UI components.
    *   **`dashboard/`**: Components specific to the dashboard layout and pages.
    *   **`discipleship-goals/`**: Components related to discipleship goals.
    *   **`members/`**: Components related to member management.
    *   **`reports/`**: Components related to generating and displaying reports.
    *   **`social-media/`**: Components for social media integration.
    *   **`teams/`**: Components related to team management.
    *   **`ui/`**: Generic UI components (buttons, cards, forms, etc.), largely from Shadcn/ui.
*   **`hooks/`**: Custom React hooks for reusable logic.
*   **`lib/`**: Utility functions, constants, configurations, and shared code.
    *   **`api/`**: Server-side API utility functions, middleware, error handling.
    *   **`client/`**: Client-side utility functions, API client.
    *   **`server/`**: Server-specific logic, including database models and repositories.
    *   **`shared/`**: Code shared between client and server (e.g. types).
    *   **`social-media/`**: Logic for interacting with social media platform APIs.
*   **`middleware.ts`**: Next.js middleware for handling requests.
*   **`models/`**: Mongoose schema definitions for database collections. (e.g. `center.ts` no longer contains `parentHQId` as it's obsolete).
*   **`public/`**: Static assets like images and icons.
*   **`services/`**: Business logic services that encapsulate interactions with external services (Email, SMS, AI, etc.) and core application functionalities.
*   **`test/`**: Unit and integration tests.
*   **`types/`**: TypeScript type definitions.
*   **`workers/`**: Code for background workers that handle tasks like sending notifications or generating reports.
*   **`CHANGES_SUMMARY.md`**: A summary of changes in the project. (Note: This file may still contain outdated terminology. Refer to this documentation for current terms like Center and Global Admin).
*   **`README.md`**: Project overview, setup, and deployment instructions.
*   **`next.config.js` / `next.config.ts`**: Next.js configuration files.
*   **`tsconfig.json`**: TypeScript configuration.
*   **`package.json`**: Project dependencies and scripts.

This structure helps in organizing the codebase logically, separating concerns, and making it easier for developers to navigate and understand the project. The hierarchical structure is now typically Global Admin overseeing Centers and Regional Clusters.

## 2. Authentication Flow

Authentication in this application is handled by NextAuth.js, providing a secure and robust way to manage user sessions and credentials.

### Key Components:

*   **NextAuth.js (`next-auth`)**: The core library used for authentication. It's configured in `auth/config.ts` and the API route `app/api/auth/[...nextauth]/route.ts`.
*   **Credentials Provider**: The primary method for authentication is username (email) and password.
*   **MongoDB Adapter**: NextAuth.js is configured to use MongoDB to store user accounts, sessions, and verification tokens. This is set up in `lib/server/auth/adapter.ts`.
*   **User Model (`models/user.ts`)**: Defines the schema for user documents in MongoDB, including fields for email, password (hashed), roles (e.g. `GLOBAL_ADMIN`, `CENTER_ADMIN`), permissions, etc.

### Registration:

1.  **UI**: The registration form is located at `app/(auth)/register/page.tsx`.
2.  **API Route**: When a user submits the registration form, a request is made to the `POST /api/auth/register` endpoint.
    *   The handler for this route is in `app/api/auth/register/route.ts`.
3.  **Process**:
    *   The API route validates the input (email, password, name).
    *   It checks if a user with the given email already exists.
    *   If not, it hashes the password using a strong hashing algorithm (e.g., bcrypt).
    *   A new user document is created in the `users` collection in MongoDB.
    *   An initial role or permissions might be assigned to the new user.
    *   A "welcome" email might be sent to the user (handled by `services/emailService.ts`).

### Login:

1.  **UI**: The login form is located at `app/(auth)/login/page.tsx`.
2.  **NextAuth.js Endpoint**: The login form submits credentials to the NextAuth.js `signIn` endpoint (typically `/api/auth/signin/credentials`).
3.  **Process**:
    *   NextAuth.js, using the configured Credentials Provider, receives the email and password.
    *   The `authorize` function in the Credentials Provider configuration (in `auth/config.ts`) is executed.
    *   This function retrieves the user from the database by email.
    *   It compares the provided password with the hashed password stored in the database.
    *   If the credentials are valid, a session is created for the user, and a session token (usually a JWT) is returned to the client and stored in a cookie.
4.  **Session Management**:
    *   The client-side uses `next-auth/react`'s `useSession` hook or `getSession` function to access the user's session information.
    *   The `SessionProvider` component in `components/session-provider.tsx` wraps the application to make the session available globally.
    *   Middleware (`middleware.ts`) is used to protect routes, redirecting unauthenticated users to the login page.

### Forgot Password / Password Reset:

1.  **UI**: The "Forgot Password" form is at `app/(auth)/forgot-password/page.tsx`.
2.  **Request Reset**:
    *   User enters their email address.
    *   A request is made to an API endpoint (e.g., `POST /api/auth/forgot-password` - *needs verification in the codebase*).
    *   The system generates a unique password reset token and stores it (often associated with the user and an expiry time).
    *   An email is sent to the user with a link containing the reset token.
3.  **Reset Password**:
    *   User clicks the link in the email, which directs them to a password reset page (e.g., `app/(auth)/reset-password/[token]/page.tsx` - *needs verification*).
    *   The user enters a new password.
    *   The system validates the token (checks if it exists, hasn't expired, and matches the user).
    *   If valid, the user's password in the database is updated with the new hashed password.
    *   The reset token is invalidated.

### Authorization and Permissions:

*   The `User` model includes fields for `roles` (e.g. `GLOBAL_ADMIN`, `CENTER_ADMIN`) and `permissions`.
*   The application likely has a system to check these roles/permissions to control access to certain features or data. This might be implemented in:
    *   API route handlers (e.g., using middleware or decorators).
    *   Frontend components (to conditionally render UI elements).
*   The `app/api/auth/check-permission/route.ts` suggests a dedicated endpoint for permission checking.

### Session Initialization / Mocking:

*   `app/api/auth/init/route.ts` and `app/api/auth/mock-session/route.ts` suggest utilities for initializing or mocking user sessions, likely for development or testing purposes.

## 3. Dashboard Functionality

The main dashboard serves as the central hub for users after logging in, providing an overview of key metrics, recent activities, and quick access to various modules.

### Core Components:

*   **Layout (`app/(dashboard)/layout.tsx`)**: Defines the overall structure for all dashboard pages, typically including a sidebar for navigation and a header.
*   **Main Dashboard Page (`app/(dashboard)/dashboard/page.tsx`)**: The landing page of the dashboard section.
*   **Sidebar (`components/dashboard/sidebar.tsx`)**: Provides navigation links to different modules and features within the dashboard.
*   **Header (`components/dashboard/header.tsx`)**: Typically contains user information, notifications, and possibly a search bar or quick actions.

### Key Features and Sections:

1.  **Dashboard Stats (`components/dashboard/dashboard-stats.tsx`)**:
    *   Displays key performance indicators (KPIs) or summary statistics.
    *   Examples might include: Total Members, New Members This Month, Upcoming Events, Active Small Groups, etc.
    *   Data is fetched from various API endpoints related to members, events, groups, etc.
    *   These are often presented as individual "stat cards" (`components/ui/stats-card.tsx`).

2.  **Dashboard Chart (`components/dashboard/dashboard-chart.tsx`)**:
    *   Visualizes data trends, such as member growth over time, attendance records, or financial summaries.
    *   Uses a charting library (the specific library needs to be identified from `package.json` or component imports, e.g., Recharts, Chart.js).
    *   Data is fetched from specific API endpoints designed to provide aggregated data suitable for charting.
    *   The `components/ui/chart-card.tsx` might be a wrapper for these charts.

3.  **Activity Feed (`components/dashboard/activity-feed.tsx`) / Recent Activity (`components/dashboard/recent-activity.tsx`)**:
    *   Shows a chronological list of recent important actions or events within the system.
    *   Examples: New member registrations, event creations, follow-up completions, etc.
    *   This data is likely fetched from a notifications or audit log collection in the database via an API endpoint.

4.  **Upcoming Events (`components/dashboard/upcoming-events.tsx` and `components/dashboard/upcoming-events-card.tsx`)**:
    *   Lists events scheduled for the near future.
    *   Data is fetched from the events module API (`/api/events`).
    *   Each event might be displayed in an `components/ui/event-card.tsx`.

### Data Fetching and Display:

*   **Server Components & Client Components**: Next.js allows for both server-rendered components (fetching data on the server before sending to the client) and client-rendered components (fetching data in the browser). The dashboard likely uses a combination.
    *   Initial page load might involve server components for faster perceived performance.
    *   Dynamic updates or interactive elements might use client components that fetch data using `useEffect` and `fetch` or a data fetching library like SWR/React Query (if used, check `hooks/use-api.ts` or `lib/client/api/api-client.ts`).
*   **API Endpoints**: The dashboard components make requests to various API endpoints under `app/api/` to get the necessary data. For example:
    *   `/api/members` for member counts.
    *   `/api/events` for upcoming events.
    *   `/api/attendance` for attendance statistics.
    *   Custom endpoints might exist to provide aggregated data specifically for dashboard widgets.
*   **State Management**: Client-side state (e.g., filters, sorting, UI state) might be managed using React's built-in state (`useState`, `useReducer`) or a global state management library if the complexity warrants it (check `lib/store.ts` if it exists and is used for this purpose).
*   **Loading and Error States**: Components typically handle loading states (e.g., displaying skeletons - `components/ui/skeleton.tsx`) while data is being fetched and error states if an API call fails (e.g., using `components/ui/error-alert.tsx`).

The dashboard page (`app/(dashboard)/dashboard/page.tsx`) orchestrates these components, fetching the necessary data and passing it down as props or relying on components to fetch their own data.

## 4. Major Feature Modules

This section details the functionality of the core modules within the Church Management System. Each module typically consists of data models, API routes for managing the data, and frontend components for user interaction.

### 4.1 Attendance Module

**Purpose**: To track attendance for various events, services, or group meetings.

**Data Model (`models/attendance.ts`)**:
*   `memberId`: ObjectId (references `User` or `Member` model) - The person attending.
*   `eventId`: ObjectId (references `Event` model) - The event for which attendance is being recorded.
*   `date`: Date - The date of attendance.
*   `status`: String (e.g., "Present", "Absent", "Excused") - The attendance status.
*   `notes`: String (optional) - Any additional notes.
*   `recordedBy`: ObjectId (references `User` model) - Who recorded the attendance.

**API Routes (`app/api/attendance/`)**:
*   **`GET /api/attendance`**:
    *   Fetches a list of attendance records.
    *   Supports pagination and filtering (e.g., by event, member, date range).
    *   Handler: `app/api/attendance/route.ts`
*   **`POST /api/attendance`**:
    *   Creates a new attendance record.
    *   Expects data like `memberId`, `eventId`, `date`, `status`.
    *   Handler: `app/api/attendance/route.ts`
*   **`GET /api/attendance/[id]`**:
    *   Fetches a specific attendance record by its ID.
    *   Handler: `app/api/attendance/[id]/route.ts`
*   **`PUT /api/attendance/[id]`**:
    *   Updates an existing attendance record.
    *   Handler: `app/api/attendance/[id]/route.ts`
*   **`DELETE /api/attendance/[id]`**:
    *   Deletes an attendance record.
    *   Handler: `app/api/attendance/[id]/route.ts`
*   **Other specific routes (from `ls` output)**:
    *   `app/api/attendance/[id]/event/[eventId]/route.ts`: Likely fetches attendance for a specific event.
    *   `app/api/attendance/[id]/member/[memberId]/route.ts`: Likely fetches attendance for a specific member.
    *   `app/api/attendance/event/[eventId]/route.ts`: Fetches all attendance for a specific event.
    *   `app/api/attendance/member/[memberId]/route.ts`: Fetches all attendance for a specific member.
    *   `app/api/attendance/report/route.ts`: Generates attendance reports.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/attendance/page.tsx`)**:
    *   Displays a list or table of attendance records.
    *   Allows users to view, filter, and possibly add new attendance records.
    *   May include a calendar view or summary statistics.
*   **Attendance Detail Page (`app/(dashboard)/attendance/[id]/page.tsx`)**:
    *   Shows details of a specific attendance record.
    *   Allows editing or deleting the record.
*   **Forms**:
    *   Forms for adding/editing attendance records (likely within the pages or in modal dialogs).
*   **Integration with other modules**:
    *   Linked from the `Members` module (e.g., `components/members/attendance-tab.tsx`) to show a member's attendance history.
    *   Linked from the `Events` module to manage attendance for a specific event.

**Functionality**:
*   Users with appropriate permissions can record attendance for members at events.
*   Attendance data can be viewed in various formats (lists, reports).
*   Ability to filter attendance records by date, event, member, etc.
*   Generate attendance reports (e.g., percentage attendance for an event, individual attendance summary).
*   The system might send reminders or notifications related to attendance (e.g., to absentees, if integrated with notification services).
---

*(Self-correction: I will proceed to document other major modules following a similar structure. I will inspect the `ls` output again to ensure I cover all relevant modules listed under `app/(dashboard)/` and their corresponding API routes and models.)*

### 4.2 Centers Module

**Purpose**: To manage information about different church centers or branches. (Note: The term "Center" now standardizes previous concepts like "Main Center" or "Branch Location" into a single entity type representing a church location/branch).

**Data Model (`models/center.ts`)**:
*   `name`: String - The name of the center.
*   `location`: String - Physical address or description of the center's location.
*   `pastorId`: ObjectId (references `User` model) - The pastor or leader in charge of the center.
*   `clusterId`: ObjectId (references `Cluster` model) - The cluster this center belongs to.
*   `establishedDate`: Date - When the center was established.
*   `contactEmail`: String - Contact email for the center.
*   `contactPhone`: String - Contact phone for the center.
*   `meetingSchedule`: String - Details about meeting times and days.
*   `capacity`: Number - Seating or member capacity.
    (Note: `parentHQId` field is obsolete and has been removed from this model).

**API Routes (`app/api/centers/`)**:
*   **`GET /api/centers`**:
    *   Fetches a list of all centers.
    *   Supports pagination and filtering (e.g., by cluster).
    *   Handler: `app/api/centers/route.ts`
*   **`POST /api/centers`**:
    *   Creates a new center.
    *   Handler: `app/api/centers/route.ts`
*   **`GET /api/centers/[id]`**:
    *   Fetches a specific center by its ID.
    *   Handler: `app/api/centers/[id]/route.ts`
*   **`PUT /api/centers/[id]`**:
    *   Updates an existing center.
    *   Handler: `app/api/centers/[id]/route.ts`
*   **`DELETE /api/centers/[id]`**:
    *   Deletes a center.
    *   Handler: `app/api/centers/[id]/route.ts`

**Frontend Components**:
*   **Main Page (`app/(dashboard)/centers/page.tsx`)**:
    *   Displays a list or cards of centers (e.g., using a generic card or a specific `center-card.tsx`).
    *   Allows users to view, filter, and add new centers.
*   **New Center Page (`app/(dashboard)/centers/new/page.tsx`)**:
    *   Form for creating a new center.
*   **Center Detail Page (`app/(dashboard)/centers/[id]/page.tsx`)**:
    *   Shows details of a specific center.
    *   Allows editing or deleting the center.
    *   May include tabs for related information like members, events, or reports specific to that center.
    *   Sub-pages like `app/(dashboard)/centers/[id]/edit/page.tsx`, `app/(dashboard)/centers/[id]/members/page.tsx`, `app/(dashboard)/centers/[id]/reports/page.tsx` confirm this.
*   **Center Card (`components/ui/center-card.tsx` - assumed name, based on `cluster-card.tsx`):**
    *  A UI component to display summary information about a center.

**Functionality**:
*   Administrators can add, view, edit, and delete church centers.
*   Ability to assign a pastor/leader to a center.
*   Group centers into clusters.
*   Store and display practical information about each center (location, contact, schedule).
*   View members and reports associated with a specific center.

---

### 4.3 Clusters Module

**Purpose**: To group multiple centers into larger administrative or geographical units called clusters. A cluster might also exist as a regional grouping not directly parented by a single center.

**Data Model (`models/cluster.ts`)**:
*   `name`: String - The name of the cluster.
*   `leaderId`: ObjectId (references `User` model) - The leader responsible for the cluster.
*   `description`: String (optional) - A brief description of the cluster.
*   `region`: String (optional) - Geographical region of the cluster.
*   `centerId`: ObjectId (optional, references `Center` model) - If the cluster is directly associated with a parent Center. The comment for this field was updated to reflect its optional nature for regional groupings.

**API Routes (`app/api/clusters/`)**:
*   **`GET /api/clusters`**:
    *   Fetches a list of all clusters.
    *   Handler: `app/api/clusters/route.ts`
*   **`POST /api/clusters`**:
    *   Creates a new cluster.
    *   Handler: `app/api/clusters/route.ts`
*   **`GET /api/clusters/[id]`**:
    *   Fetches a specific cluster by its ID.
    *   Handler: `app/api/clusters/[id]/route.ts`
*   **`PUT /api/clusters/[id]`**:
    *   Updates an existing cluster.
    *   Handler: `app/api/clusters/[id]/route.ts`
*   **`DELETE /api/clusters/[id]`**:
    *   Deletes a cluster.
    *   Handler: `app/api/clusters/[id]/route.ts`
*   **Other specific routes**:
    *   `app/api/clusters/[id]/centers/route.ts`: Fetches all centers belonging to a specific cluster.
    *   `app/api/clusters/[id]/reports/route.ts`: Generates reports specific to a cluster.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/clusters/page.tsx`)**:
    *   Displays a list or cards of clusters (e.g., using `components/ui/cluster-card.tsx`).
    *   Allows users to view, filter, and add new clusters.
*   **New Cluster Page (`app/(dashboard)/clusters/new/page.tsx`)**:
    *   Form for creating a new cluster. Logic for `assignToGlobal` (previously `assignToHQ`) has been updated.
*   **Cluster Detail Page (`app/(dashboard)/clusters/[id]/page.tsx`)**:
    *   Shows details of a specific cluster.
    *   Allows editing or deleting the cluster.
    *   Likely includes tabs or sections for viewing centers within that cluster, and cluster-specific reports.
    *   Sub-pages like `app/(dashboard)/clusters/[id]/edit/page.tsx` and `app/(dashboard)/clusters/[id]/centers/page.tsx` support this.
*   **Cluster Card (`components/ui/cluster-card.tsx`)**:
    *   A UI component to display summary information about a cluster.

**Functionality**:
*   Administrators can define and manage clusters.
*   Assign leaders to clusters.
*   Organize centers by grouping them into clusters, or manage regional clusters independently.
*   View centers and generate reports at the cluster level.

---

### 4.4 Discipleship Goals Module

**Purpose**: To define, track, and manage spiritual growth or discipleship goals for members or the church community. Goals can be set at Global, Center, Cluster, Small Group, or Individual levels.

**Data Model (`models/discipleshipGoal.ts`)**:
*   `title`: String - The name or title of the goal.
*   `description`: String - A detailed description of the goal.
*   `level`: String (e.g. "GLOBAL", "CENTER") - Scope of the goal.
*   `category`: String (e.g., "Prayer", "Study", "Service", "Evangelism") - The area of discipleship this goal falls under.
*   `targetAudience`: String (e.g., "New Believers", "All Members", "Leaders").
*   `measurableMetrics`: String - How progress towards the goal will be measured (e.g., "Books read", "Hours volunteered", "People shared with").
*   `startDate`: Date (optional) - When the goal or tracking begins.
*   `endDate`: Date (optional) - When the goal or tracking ends.
*   `isActive`: Boolean - Whether the goal is currently active.
*   `relatedResources`: [String] (optional) - Links or references to materials supporting the goal.

**API Routes (`app/api/discipleship-goals/`)**:
*   **`GET /api/discipleship-goals`**:
    *   Fetches a list of all discipleship goals.
    *   Handler: `app/api/discipleship-goals/route.ts`
*   **`POST /api/discipleship-goals`**:
    *   Creates a new discipleship goal.
    *   Handler: `app/api/discipleship-goals/route.ts`
*   **`GET /api/discipleship-goals/[id]`**:
    *   Fetches a specific discipleship goal by its ID.
    *   Handler: `app/api/discipleship-goals/[id]/route.ts`
*   **`PUT /api/discipleship-goals/[id]`**:
    *   Updates an existing discipleship goal.
    *   Handler: `app/api/discipleship-goals/[id]/route.ts`
*   **`DELETE /api/discipleship-goals/[id]`**:
    *   Deletes a discipleship goal.
    *   Handler: `app/api/discipleship-goals/[id]/route.ts`

**Frontend Components**:
*   **Main Page (`app/(dashboard)/discipleship-goals/page.tsx`)**:
    *   Displays a list of discipleship goals.
    *   Allows users to create, view, edit, and delete goals.
*   **Goal Chart (`app/(dashboard)/discipleship-goals/goal-chart.tsx` and `components/discipleship-goals/goal-chart.tsx`)**:
    *   Visualizes progress towards goals or distribution of goals by category.
    *   This component is likely used on the main page or a dedicated reporting section for discipleship.
*   **Forms**: Forms for creating and editing goals, likely integrated into the main page or modals.
*   **Integration with Member Module**: Goals might be assignable to individual members, or members' progress towards these goals could be tracked in their profiles (see `app/(dashboard)/members/spiritual-growth-tab.tsx`).

**Functionality**:
*   Define and categorize various discipleship goals for the church.
*   Track the status and progress of these goals (potentially at an organizational level or individual member level if extended).
*   Visualize goal-related data through charts.
*   Provide resources and metrics associated with each goal.

---

### 4.5 Events Module

**Purpose**: To manage church events, including creation, scheduling, promotion, and tracking. Events can be scoped as "GLOBAL" or "CENTER" specific.

**Data Model (`models/event.ts`)**:
*   `name`: String - The name of the event.
*   `scope`: String ("GLOBAL" or "CENTER") - Scope of the event.
*   `centerId`: ObjectId (optional, if scope is "CENTER")
*   `description`: String - Detailed information about the event.
*   `startDate`: Date - Start date and time of the event.
*   `endDate`: Date - End date and time of the event.
*   `location`: String - Venue or location of the event (can be physical or virtual).
*   `isOnline`: Boolean - Flag if the event is online.
*   `onlineUrl`: String (optional) - Link for online events.
*   `organizer`: String (optional) - Person or team organizing the event.
*   `category`: String (e.g., "Service", "Workshop", "Conference", "Outreach").
*   `tags`: [String] (optional) - Keywords for filtering or searching events.
*   `flyerUrl`: String (optional) - Link to an event flyer (possibly integrated with the Flyers module).
*   `registrationRequired`: Boolean - Whether attendees need to register.
*   `registrationDeadline`: Date (optional) - Deadline for registration.
*   `maxAttendees`: Number (optional) - Maximum number of participants.

**API Routes (`app/api/events/`)**:
*   **`GET /api/events`**:
    *   Fetches a list of events. Supports filtering (e.g., by date, category, scope).
    *   Handler: `app/api/events/route.ts`
*   **`POST /api/events`**:
    *   Creates a new event.
    *   Handler: `app/api/events/route.ts`
*   **`GET /api/events/[id]`**:
    *   Fetches a specific event by its ID.
    *   Handler: `app/api/events/[id]/route.ts`
*   **`PUT /api/events/[id]`**:
    *   Updates an existing event.
    *   Handler: `app/api/events/[id]/route.ts`
*   **`DELETE /api/events/[id]`**:
    *   Deletes an event.
    *   Handler: `app/api/events/[id]/route.ts`
*   **Other specific routes**:
    *   `app/api/events/[id]/attendance/route.ts`: Manages attendance for a specific event.
    *   `app/api/events/[id]/register/route.ts`: Handles registration for an event.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/events/page.tsx`)**:
    *   Displays a list, calendar, or cards of events (using `components/ui/event-card.tsx`).
    *   Allows users to create, view, edit, and delete events.
    *   Provides filtering by date, category, etc.
*   **Event Detail Page**: Likely clicking on an event card or list item navigates to a detailed view (structure not explicitly shown in `ls` for `app/(dashboard)/events/[id]/page.tsx` but is standard).
    *   Shows comprehensive details of the event.
    *   May include options to register, view attendees, or manage event-specific settings.
*   **Event Card (`components/ui/event-card.tsx`)**:
    *   Displays summary information for an event.
*   **Event Service (`app/(dashboard)/events/event-service.ts`)**: Client-side service for interacting with event APIs.
*   **Integration**:
    *   Events are displayed on the main dashboard (`components/dashboard/upcoming-events.tsx`).
    *   Attendance module is linked to events.
    *   Teams module may have an events tab (`components/teams/events-tab.tsx`).

**Functionality**:
*   Create and manage detailed event information.
*   Schedule events with start and end dates/times.
*   Categorize and tag events for better organization and discoverability.
*   Handle event registration if required.
*   Manage event attendance (integration with Attendance Module).
*   Promote events, potentially by linking flyers.

---

### 4.6 Flyers Module

**Purpose**: To create, manage, and distribute promotional flyers for church events, programs, or announcements. This module seems to distinguish between general `Flyers` and `ProgramFlyers`, and also uses `FlyerTemplates`.

**Data Models**:
*   **`models/flyer.ts` (General Flyer)**:
    *   `title`: String - Title of the flyer.
    *   `eventId`: ObjectId (references `Event` model, optional) - Event associated with the flyer.
    *   `programId`: ObjectId (references `Program` model, if a separate Program model exists, or could be a generic ID) - Program associated with the flyer.
    *   `imageUrl`: String - URL of the flyer image (likely hosted on Cloudinary).
    *   `description`: String (optional) - Brief description or text content for the flyer.
    *   `templateId`: ObjectId (references `FlyerTemplate` model, optional) - Template used for the flyer.
    *   `status`: String (e.g., "Draft", "Published", "Archived").
    *   `createdBy`: ObjectId (references `User` model).
    *   `createdAt`: Date.
*   **`models/programFlyer.ts`**: This might be a specialized type of flyer or a way to link flyers to specific programs. The exact fields need to be checked.
*   **`models/flyerTemplate.ts`**:
    *   `name`: String - Name of the template.
    *   `templateData`: String (JSON or other format) - Structure and design of the template.
    *   `previewImageUrl`: String (optional) - Preview image of the template.
    *   `category`: String (optional).

**API Routes**:
*   **Flyers (`app/api/flyers/`)**:
    *   `GET /api/flyers`, `POST /api/flyers`
    *   `GET /api/flyers/[id]`, `PUT /api/flyers/[id]`, `DELETE /api/flyers/[id]`
*   **Program Flyers (`app/api/program-flyers/`)**:
    *   Similar CRUD routes for program-specific flyers.
*   **Flyer Templates (`app/api/flyer-templates/`)**:
    *   Similar CRUD routes for managing templates.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/flyers/page.tsx`)**:
    *   Displays a gallery or list of created flyers.
    *   Allows users to create new flyers (possibly from templates), view, edit, and delete existing ones.
*   **New Flyer Page (`app/(dashboard)/flyers/new/page.tsx`)**:
    *   Interface for creating a new flyer. This might involve selecting a template, uploading images, adding text, and customizing the design.
    *   Likely uses `components/ui/image-upload.tsx` and `components/ui/image-manager.tsx`.
*   **Flyer Service (`app/(dashboard)/flyers/flyer-service.ts`)**: Client-side service for flyer-related API calls.
*   **Flyer Worker (`workers/flyerWorker.ts`)**: May handle background tasks like generating flyer previews or processing images.

**Functionality**:
*   Create custom flyers for events, programs, or announcements.
*   Use predefined templates to speed up flyer creation.
*   Manage a library of flyer templates.
*   Upload and manage images for flyers (integration with Cloudinary).
*   Distribute flyers (e.g., by providing shareable links or downloadable images).
*   Associate flyers with specific events or programs.

---

### 4.7 Follow-ups Module

**Purpose**: To manage and track follow-up activities with members, visitors, or new converts.

**Data Model (`models/followUp.ts`)**:
*   `memberId`: ObjectId (references `Member` or `User` model) - The person being followed up.
*   `assigneeId`: ObjectId (references `User` model) - The person assigned to do the follow-up.
*   `type`: String (e.g., "Visitor", "New Convert", "Pastoral Care", "Missed Service").
*   `status`: String (e.g., "Pending", "In Progress", "Completed", "Cancelled").
*   `dueDate`: Date (optional) - When the follow-up should ideally be completed.
*   `completionDate`: Date (optional) - When the follow-up was actually completed.
*   `notes`: String - Details about the follow-up interaction, progress, or outcome.
*   `priority`: String (e.g., "High", "Medium", "Low").
*   `relatedEventId`: ObjectId (references `Event` model, optional) - If the follow-up is related to an event.

**API Routes (`app/api/follow-ups/`)**:
*   **`GET /api/follow-ups`**: Fetches follow-up records. Handler: `app/api/follow-ups/route.ts`.
*   **`POST /api/follow-ups`**: Creates a new follow-up. Handler: `app/api/follow-ups/route.ts`.
*   **`GET /api/follow-ups/[id]`**: Fetches a specific follow-up. Handler: `app/api/follow-ups/[id]/route.ts`.
*   **`PUT /api/follow-ups/[id]`**: Updates a follow-up. Handler: `app/api/follow-ups/[id]/route.ts`.
*   **`DELETE /api/follow-ups/[id]`**: Deletes a follow-up. Handler: `app/api/follow-ups/[id]/route.ts`.
*   **Other specific routes (from `ls` output)**:
    *   `app/api/follow-ups/assignee/[assigneeId]/route.ts`: Fetches follow-ups assigned to a specific user.
    *   `app/api/follow-ups/member/[memberId]/route.ts`: Fetches follow-ups for a specific member.
    *   `app/api/follow-ups/status/[status]/route.ts`: Fetches follow-ups by status.
    *   `app/api/follow-ups/overdue/route.ts`: Fetches overdue follow-ups.
    *   `app/api/follow-ups/report/route.ts`: Generates reports on follow-up activities.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/follow-ups/page.tsx`)**:
    *   Displays a list or board of follow-up tasks.
    *   Allows filtering by assignee, status, member, etc.
    *   Users can create, view, update, and manage follow-ups.
*   **New Follow-up Page (`app/(dashboard)/follow-ups/new/page.tsx`)**:
    *   Form for creating a new follow-up task.
*   **Follow-up Detail Page (`app/(dashboard)/follow-ups/[id]/page.tsx`)**:
    *   Shows details of a specific follow-up.
    *   Allows updating status, adding notes, and reassigning.
*   **Follow-up Card (`components/ui/follow-up-card.tsx`)**: UI component for displaying follow-up summaries.
*   **Follow-up Service (`app/(dashboard)/follow-ups/follow-up-service.ts`)**: Client-side service for API interactions.
*   **Integration**:
    *   Linked with the `Members` module (e.g., `components/members/follow-ups-tab.tsx`) to show a member's follow-up history.

**Functionality**:
*   Create, assign, and track follow-up tasks for individuals.
*   Categorize follow-ups by type and priority.
*   Set due dates and monitor progress.
*   Record notes and outcomes of follow-up interactions.
*   Generate reports on follow-up performance and completion rates.
*   Notify assignees about new or overdue follow-ups (potential integration with Notifications module).

---

### 4.8 Groups / Small Groups Module

**Purpose**: To manage small groups, cell groups, or other types of fellowship or ministry groups within the church. The `ls` output shows both `app/(dashboard)/groups/` and `app/(dashboard)/small-groups/`. These might be aliases or represent different hierarchical levels of groups. Documentation will focus on `small-groups` as it has more specific content.

**Data Model (`models/smallGroup.ts`)**:
*   `name`: String - The name of the small group.
*   `leaderId`: ObjectId (references `User` model) - The leader of the group.
*   `description`: String (optional) - A brief description of the group's focus or purpose.
*   `meetingSchedule`: String - When and how often the group meets (e.g., "Tuesdays 7 PM weekly").
*   `meetingLocation`: String - Where the group meets (can be physical or virtual).
*   `ageRange`: String (optional) (e.g., "Youth", "Adults", "All Ages").
*   `gender`: String (optional) (e.g., "Male", "Female", "Mixed").
*   `category`: String (optional) (e.g., "Bible Study", "Prayer Group", "Service Group").
*   `isActive`: Boolean - Whether the group is currently active.
*   `members`: [ObjectId] (references `Member` or `User` model) - List of members in the group.

**API Routes (`app/api/small-groups/`)**:
*   **`GET /api/small-groups`**: Fetches a list of small groups. Handler: `app/api/small-groups/route.ts`.
*   **`POST /api/small-groups`**: Creates a new small group. Handler: `app/api/small-groups/route.ts`.
*   **`GET /api/small-groups/[id]`**: Fetches a specific small group. Handler: `app/api/small-groups/[id]/route.ts`.
*   **`PUT /api/small-groups/[id]`**: Updates a small group. Handler: `app/api/small-groups/[id]/route.ts`.
*   **`DELETE /api/small-groups/[id]`**: Deletes a small group. Handler: `app/api/small-groups/[id]/route.ts`.
*   **Other specific routes**:
    *   `app/api/small-groups/[id]/members/route.ts`: Manages members of a specific small group (add, remove, list).

**Frontend Components**:
*   **Main Page (`app/(dashboard)/small-groups/page.tsx`)**:
    *   Displays a list or directory of small groups.
    *   Allows users to search, filter, and view details of groups.
    *   Administrators can create and manage groups.
*   **Small Group Detail Page (`app/(dashboard)/small-groups/[id]/page.tsx`)**:
    *   Shows detailed information about a specific small group, including its leader, members, meeting details, etc.
    *   Allows group leaders or admins to manage members, update group information, and possibly track attendance or post announcements for the group.
*   **Small Group Card (`components/ui/small-group-card.tsx`)**: UI component for displaying summary information about a small group.
*   **The `app/(dashboard)/groups/` directory and its sub-pages (e.g., `[id]/edit`, `[id]/members`) suggest a similar structure, possibly for a different type or higher level of grouping.** Further investigation of `app/(dashboard)/groups/page.tsx` would clarify its exact relationship with `small-groups`.

**Functionality**:
*   Create and manage small groups with details like leader, schedule, location, and focus.
*   List members belonging to each group.
*   Allow users to find and potentially join small groups.
*   Enable group leaders to manage their group information and members.
*   Track group activities (e.g., attendance, study materials) - potential extension.

---

### 4.9 Members Module

**Purpose**: To manage the database of church members, including their personal information, spiritual growth, involvement, and history.

**Data Model (`models/member.ts`)**:
*   `userId`: ObjectId (references `User` model, if members are also users with login capability) - Or could be standalone if members don't always have system access.
*   `firstName`: String.
*   `lastName`: String.
*   `dateOfBirth`: Date.
*   `gender`: String.
*   `address`: String.
*   `city`: String.
*   `state`: String.
*   `zipCode`: String.
*   `phoneNumber`: String.
*   `email`: String (unique).
*   `membershipDate`: Date - Date they became a member.
*   `status`: String (e.g., "Active", "Inactive", "Visitor", "Transferred").
*   `profilePictureUrl`: String (optional).
*   `spiritualJourney`: [{ milestone: String, date: Date, notes: String }] (example, actual structure might vary based on `spiritual-growth-tab.tsx`).
*   `smallGroupId`: ObjectId (references `SmallGroup` model, optional).
*   `teamIds`: [ObjectId] (references `Team` model, optional).
*   Many other fields are possible for family relationships, skills, interests, etc.

**API Routes (`app/api/members/`)**:
*   **`GET /api/members`**: Fetches a list of members. Handler: `app/api/members/route.ts`.
*   **`POST /api/members`**: Creates a new member. Handler: `app/api/members/route.ts`.
*   **`GET /api/members/[id]`**: Fetches a specific member. Handler: `app/api/members/[id]/route.ts`.
*   **`PUT /api/members/[id]`**: Updates a member's information. Handler: `app/api/members/[id]/route.ts`.
*   **`DELETE /api/members/[id]`**: Deletes a member record. Handler: `app/api/members/[id]/route.ts`.
*   **Numerous specific routes (from `ls` output)**:
    *   For managing attendance (`/attendance`), follow-ups (`/follow-ups`), notes (`/notes`), spiritual growth (`/spiritual-growth`), teams (`/teams`), training (`/training`), etc., all under `app/api/members/[id]/`. This indicates a rich set of interactions for each member.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/members/page.tsx`)**:
    *   Displays a list or grid of members (using `components/ui/member-card.tsx`).
    *   Provides search, filtering (by status, group, etc.), and pagination.
    *   Allows adding new members.
*   **New Member Page (`app/(dashboard)/members/new/page.tsx`)**:
    *   Form for adding a new member's details.
*   **Member Detail Page (`app/(dashboard)/members/[id]/page.tsx`)**:
    *   Shows a comprehensive profile of the member.
    *   Uses tabs for different aspects:
        *   `components/members/attendance-tab.tsx`: Member's attendance history.
        *   `components/members/follow-ups-tab.tsx`: Member's follow-up records.
        *   `components/members/spiritual-growth-tab.tsx`: Tracks spiritual development, possibly linked to Discipleship Goals. (Uses `spiritual-growth-service.ts`)
        *   `components/members/teams-tab.tsx`: Teams the member is part of.
        *   `components/members/training-tab.tsx`: Training or classes attended by the member.
*   **Member Card (`components/ui/member-card.tsx`)**: UI for displaying member summaries.

**Functionality**:
*   Maintain a comprehensive database of member information.
*   Track member status, attendance, and involvement in groups and teams.
*   Record and manage spiritual growth milestones and training progress.
*   Manage follow-ups associated with members.
*   Advanced search and filtering capabilities.
*   Generate reports based on member data.

---

### 4.10 Notifications Module

**Purpose**: To manage and deliver notifications to users within the application or via external channels (email, SMS, WhatsApp). Notifications can be targeted at different levels (Global, Center, Cluster, etc.).

**Data Model (`models/notification.ts`)**:
*   `userId`: ObjectId (references `User` model) - The recipient of the notification.
*   `title`: String - The title of the notification.
*   `message`: String - The content of the notification.
*   `type`: String (e.g., "NewEvent", "FollowUpReminder", "SystemUpdate", "Birthday").
*   `targetLevel`: String (e.g. "GLOBAL", "CENTER") - Scope of the notification.
*   `status`: String (e.g., "Unread", "Read", "Archived").
*   `link`: String (optional) - A URL to navigate to when the notification is clicked.
*   `createdAt`: Date.
*   `isPushNotification`: Boolean (optional) - If it should be sent as a push notification.
*   `isEmailNotification`: Boolean (optional) - If it should be sent as an email.
*   `isSmsNotification`: Boolean (optional) - If it should be sent as an SMS.

**API Routes (`app/api/notifications/`)**:
*   **`GET /api/notifications`**: Fetches notifications for the logged-in user. Handler: `app/api/notifications/route.ts`.
*   **`POST /api/notifications`**: Creates a new notification (likely system-generated or admin-initiated). Handler: `app/api/notifications/route.ts`.
*   **`GET /api/notifications/[id]`**: Fetches a specific notification. Handler: `app/api/notifications/[id]/route.ts`.
*   **`PUT /api/notifications/[id]`**: Updates a notification (e.g., mark as read). Handler: `app/api/notifications/[id]/route.ts`.
*   **`DELETE /api/notifications/[id]`**: Deletes a notification. Handler: `app/api/notifications/[id]/route.ts`.
*   **`POST /api/notifications/[id]/mark-as-read`**: Marks a specific notification as read.
*   **`POST /api/notifications/mark-all-as-read`**: Marks all notifications for a user as read.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/notifications/page.tsx`)**:
    *   Displays a list of all notifications for the user.
    *   Allows users to mark notifications as read or delete them.
*   **Notification Card (`components/ui/notification-card.tsx`)**: UI for displaying individual notifications.
*   **Notification Icon/Dropdown (likely in `components/dashboard/header.tsx`)**:
    *   Shows a count of unread notifications.
    *   Dropdown to display recent notifications.
*   **Notification Service (`app/(dashboard)/notifications/notification-service.ts`)**: Client-side service for API calls.
*   **Notification Actions (`app/(dashboard)/notifications/notification-actions.ts`)**: Likely contains client-side logic for managing notifications (e.g., marking as read).
*   **Notification Worker (`workers/notificationWorker.ts`)**: Handles background processing for sending out notifications via email, SMS, or WhatsApp, based on notification preferences and triggers.

**Functionality**:
*   Deliver in-app notifications to users about important events, tasks, or updates.
*   Allow users to view and manage their notifications.
*   Mark notifications as read/unread.
*   Potentially send notifications through external channels like email, SMS, or WhatsApp (requires integration with services like ZeptoMail, BulkSMS, WhatsApp Cloud API, as mentioned in README).
*   System-generated notifications (e.g., event reminders, new follow-up assignments, birthday wishes).
*   Admin-initiated notifications (e.g., announcements).

---

### 4.11 Reports Module

**Purpose**: To generate, view, and export various reports based on the data collected across different modules.

**Data Model (`models/report.ts`)**:
*   `name`: String - The name or title of the report.
*   `type`: String (e.g., "AttendanceSummary", "MemberDemographics", "FinancialContribution", "EventEngagement", "FollowUpEffectiveness").
*   `generatedBy`: ObjectId (references `User` model) - Who generated the report.
*   `generatedDate`: Date - When the report was generated.
*   `parameters`: Object - The parameters used to generate the report (e.g., date range, specific event ID, member status).
*   `data`: Object or String (could be JSON data, or a link to a generated file) - The actual report content.
*   `format`: String (e.g., "PDF", "CSV", "JSON", "DashboardView").

**API Routes (`app/api/reports/` - Note: `ls` output doesn't show specific API routes for reports, so this is a general assumption based on module existence. The actual implementation might be through specific reporting endpoints within each module, e.g., `/api/attendance/report/route.ts`):**
*   **`POST /api/reports/generate` (Hypothetical)**:
    *   Generates a new report based on type and parameters.
    *   This might trigger a background job via `workers/reportWorker.ts`.
*   **`GET /api/reports` (Hypothetical)**:
    *   Lists previously generated reports or available report templates.
*   **`GET /api/reports/[id]` (Hypothetical)**:
    *   Fetches a specific generated report.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/reports/page.tsx`)**:
    *   Provides an interface for selecting and generating different types of reports.
    *   May display a list of previously generated reports.
    *   Allows users to set parameters (filters, date ranges) for report generation.
*   **Report View (`components/reports/index.tsx` and potentially other components within this directory)**:
    *   Components for displaying the generated report data, which could be tables, charts, or summaries.
*   **Integration**:
    *   Many modules have their own reporting API endpoints (e.g., `app/api/attendance/report/route.ts`, `app/api/clusters/[id]/reports/route.ts`, `app/api/follow-ups/report/route.ts`). The main reports page might act as a central place to access these or generate cross-module reports.

**Functionality**:
*   Generate reports on various aspects of church management, such as:
    *   Attendance trends and summaries.
    *   Member demographics, growth, and engagement.
    *   Small group statistics.
    *   Follow-up effectiveness and completion rates.
    *   Event participation.
*   Allow users to customize reports using filters and parameters.
*   Export reports in different formats (e.g., CSV, PDF).
*   Visualize report data using charts and graphs.
*   The `workers/reportWorker.ts` suggests that some reports might be complex and generated asynchronously.

---

### 4.12 Social Media Module

**Purpose**: To integrate with various social media platforms for analytics, content posting (potentially), and tracking engagement. Accounts can be scoped as "GLOBAL" (for the entire organization) or "CENTER" specific.

**Data Models**:
*   **`models/socialMediaAccount.ts`**:
    *   `platform`: String (e.g., "Facebook", "Instagram", "Twitter", "YouTube", "TikTok", "Telegram").
    *   `scope`: String ("GLOBAL" or "CENTER") - Determines if the account is for the entire organization or a specific center.
    *   `centerId`: ObjectId (optional, references `Center` model) - If scope is "CENTER".
    *   `accountId`: String - The ID of the account on the platform.
    *   `accountName`: String - The name or handle of the social media account.
    *   `accessToken`: String (encrypted) - Token for API access.
    *   `refreshToken`: String (encrypted, optional) - Refresh token if applicable.
    *   `expiresAt`: Date (optional) - When the access token expires.
    *   `scopes`: [String] (optional) - Permissions granted.
    *   `lastSyncDate`: Date (optional) - When data was last fetched.
*   Potentially other models for storing fetched data like posts, analytics, follower counts, etc.

**API Routes (`app/api/social-media/`)**:
*   **Account Management (`app/api/social-media/accounts/`)**:
    *   `GET /api/social-media/accounts`: Lists connected social media accounts (filters by scope may apply, e.g. Global or Center specific).
    *   `POST /api/social-media/accounts`: Connects a new social media account (likely involves OAuth flow and defining the scope as Global or for a specific Center).
    *   `DELETE /api/social-media/accounts/[id]`: Disconnects a social media account.
*   **Data Fetching Endpoints (various under `app/api/social-media/accounts/[id]/`)**:
    *   `analytics/route.ts`: Fetches analytics data (e.g., followers, engagement).
    *   `followers/route.ts`: Fetches follower data.
    *   `posts/route.ts`: Fetches posts.
    *   Specific platform interaction points like `facebook/test/route.ts`, `instagram/test/route.ts`, `tiktok/test/route.ts`, `youtube/test/route.ts` suggest direct API interactions.

**Frontend Components**:
*   **Main Page (`app/(dashboard)/social-media/page.tsx`)**:
    *   Dashboard for viewing connected social media accounts and summary analytics (distinguishing between Global and Center accounts).
    *   Allows users to connect new accounts or manage existing ones.
*   **Layout (`app/(dashboard)/social-media/layout.tsx`)**: Specific layout for the social media section, possibly with platform-specific navigation (`components/social-media/social-media-nav.tsx`).
*   **Analytics Components (`app/(dashboard)/social-media/analytics/page.tsx`, `components/social-media/analytics-components.tsx`)**:
    *   Display charts, graphs, and stats for social media performance.
*   **UI Components**:
    *   `components/social-media/social-media-card.tsx`: Displays info for a connected account.
    *   `components/social-media/social-media-dialog.tsx`, `components/social-media/social-media-form.tsx`: For adding/editing account connections.
    *   `components/social-media/delete-account-dialog.tsx`: For confirming account disconnection.

**Libraries & Services**:
*   The `lib/social-media/` directory contains specific API wrappers for Facebook, Instagram, TikTok, Twitter, YouTube, and a Telegram scraper. This indicates direct integration with these platforms' APIs.
*   `lib/social-media/follower-tracking.ts`: Suggests functionality to track follower growth over time.
*   `workers/social-media-update.ts`: Background worker to periodically fetch new data from social media platforms.

**Functionality**:
*   Connect and authenticate multiple social media accounts from different platforms, scoped appropriately as Global or to a specific Center.
*   Fetch and display analytics data (followers, engagement, reach, etc.).
*   Track follower growth.
*   View recent posts or content from connected accounts.
*   (Potentially) Schedule or publish posts to social media platforms (though not explicitly detailed, it's a common feature in such modules).
*   Automated data updates via background workers.

---

### 4.13 Teams Module

**Purpose**: To create, manage, and organize ministry teams or volunteer groups within the church.

**Data Model (`models/team.ts`)**:
*   `name`: String - The name of the team.
*   `leaderId`: ObjectId (references `User` model) - The leader of the team.
*   `description`: String (optional) - Purpose or mission of the team.
*   `members`: [{ userId: ObjectId, role: String }] - List of team members and their roles within the team.
*   `category`: String (e.g., "Worship", "Ushering", "Media", "Outreach", "Youth Ministry").
*   `isActive`: Boolean - Whether the team is currently active.
*   `meetingSchedule`: String (optional) - Information about team meetings.
*   `responsibilities`: [String] (optional) - Key responsibilities of the team.

**API Routes (`app/api/teams/`)**:
*   **`GET /api/teams`**: Fetches a list of teams. Handler: `app/api/teams/route.ts`.
*   **`POST /api/teams`**: Creates a new team. Handler: `app/api/teams/route.ts`.
*   **`GET /api/teams/[id]`**: Fetches a specific team. Handler: `app/api/teams/[id]/route.ts`.
*   **`PUT /api/teams/[id]`**: Updates a team. Handler: `app/api/teams/[id]/route.ts`.
*   **`DELETE /api/teams/[id]`**: Deletes a team. Handler: `app/api/teams/[id]/route.ts`.
*   **Other specific routes**:
    *   `app/api/teams/[id]/members/route.ts`: Manages members of a specific team (add, remove, update role).

**Frontend Components**:
*   **Main Page (`app/(dashboard)/teams/page.tsx`)**:
    *   Displays a list or directory of teams.
    *   Allows users to search, filter, and view details of teams.
    *   Administrators can create and manage teams.
*   **Team Detail Page (`app/(dashboard)/teams/[id]/page.tsx`)**:
    *   Shows detailed information about a specific team.
    *   Uses tabs for different aspects:
        *   `components/teams/members-tab.tsx`: Lists team members and their roles. Allows managing members.
        *   `components/teams/events-tab.tsx`: Shows events associated with or organized by the team.
        *   `components/teams/responsibilities-tab.tsx`: Lists the responsibilities of the team.
*   **Forms**: Forms for creating/editing teams and adding/editing team members.

**Functionality**:
*   Create and manage church teams or ministries.
*   Assign leaders and members to teams, defining roles for members.
*   Categorize teams and define their responsibilities.
*   Associate teams with specific events they might be organizing or serving in.
*   Enable team leaders to manage their team information and members.
*   Facilitate communication and coordination within teams (potentially through integrations or future features).
*   Members can be part of multiple teams, visible on their profile (`components/members/teams-tab.tsx`).

---

## 5. External Service Integrations

The application integrates with several external services to provide enhanced functionality. Configuration for these services is primarily managed through environment variables, as detailed in the `README.md`. The `services/` directory contains dedicated service files for interacting with these external APIs.

### 5.1 Email Service (Zoho Zeptomail)

*   **Purpose**: To send transactional emails, such as welcome emails, password resets, notifications, and event reminders.
*   **Service File**: `services/emailService.ts`
*   **Configuration (Environment Variables)**:
    *   `ZEPTOMAIL_TOKEN`: API token for ZeptoMail.
    *   `EMAIL_FROM`: The default "from" email address for outgoing emails.
*   **Functionality**:
    *   The `emailService.ts` likely provides functions to send emails using the ZeptoMail API.
    *   It would handle constructing email payloads (recipient, subject, body - possibly using templates).
    *   Used by various modules:
        *   Auth module for registration confirmation and password resets.
        *   Notifications module for sending email notifications.
        *   Events module for sending event reminders or updates.
*   **Testing**: `test/services/email.test.js`

### 5.2 SMS Service (BulkSMS Nigeria)

*   **Purpose**: To send SMS messages for notifications, reminders, or communication to members who prefer or rely on SMS.
*   **Service File**: `services/smsService.ts`
*   **Configuration (Environment Variables)**:
    *   `BULKSMS_API_TOKEN`: API token for BulkSMS Nigeria.
    *   `BULKSMS_SENDER_NAME`: The sender name that appears on outgoing SMS messages (e.g., "ADN").
*   **Functionality**:
    *   The `smsService.ts` abstracts the API calls to BulkSMS Nigeria.
    *   It provides functions to send SMS messages to specified phone numbers.
    *   Used by:
        *   Notifications module for sending SMS alerts.
        *   Potentially for event reminders or critical announcements.
*   **Testing**: `test/services/sms.test.js`

### 5.3 WhatsApp Service (WhatsApp Cloud API)

*   **Purpose**: To leverage WhatsApp for communication, potentially for sending automated messages, reminders, or facilitating two-way communication (though the latter is more complex).
*   **Service File**: `services/whatsappService.ts`
*   **Configuration (Environment Variables)**:
    *   `WHATSAPP_PHONE_NUMBER_ID`: The ID of the WhatsApp phone number registered with the API.
    *   `WHATSAPP_ACCESS_TOKEN`: Access token for the WhatsApp Cloud API.
*   **WhatsApp Templates**: As specified in `README.md`, pre-approved message templates are required for sending notifications via WhatsApp. Examples include:
    *   `welcome_message`
    *   `event_reminder`
    *   `birthday_wishes`
    *   `follow_up_message`
    *   `general_notification`
*   **Functionality**:
    *   The `whatsappService.ts` interacts with the WhatsApp Cloud API to send messages based on these templates.
    *   It would handle formatting messages with the correct parameters for each template.
    *   Used by:
        *   Notifications module (e.g., for birthday wishes, event reminders, general updates).
        *   Follow-ups module for sending templated follow-up messages.
*   **Testing**: `test/services/whatsapp.test.js`

### 5.4 AI Service (Google Gemini API)

*   **Purpose**: To integrate Artificial Intelligence capabilities, possibly for content generation, summarization, sentiment analysis, or smart suggestions.
*   **Service File**: `services/aiService.ts`
*   **Configuration (Environment Variables)**:
    *   `GEMINI_API_KEY`: API key for the Google Gemini API.
*   **Functionality**:
    *   The `aiService.ts` provides methods to interact with the Gemini API.
    *   Potential uses (inferred, needs verification against actual usage in the codebase):
        *   Generating summaries for reports or long texts.
        *   Suggesting content for flyers or social media posts.
        *   Analyzing member feedback or comments.
        *   Providing insights from data.
*   **Testing**: `test/services/ai.test.js`

### 5.5 Cloudinary (Image Management)

*   **Purpose**: Used for storing, managing, and delivering images and other media assets, such as profile pictures, event flyers, and social media content.
*   **Configuration (Environment Variables)**:
    *   `CLOUDINARY_CLOUD_NAME`
    *   `CLOUDINARY_API_KEY`
    *   `CLOUDINARY_API_SECRET`
*   **Frontend Components**:
    *   `components/ui/image-upload.tsx`
    *   `components/ui/image-manager.tsx`
    *   `components/ui/cloudinary-image.tsx`
*   **API Route**: `app/api/upload/route.ts` likely handles server-side operations for image uploads to Cloudinary, such as signing requests or directly uploading.
*   **Functionality**:
    *   Securely uploading images from the application to Cloudinary.
    *   Transforming images (resizing, cropping, optimizing) on the fly.
    *   Serving optimized images to users.
    *   Used in modules like Members (profile pictures), Flyers, Events, and potentially Social Media.

### 5.6 Redis (Background Processing & Caching)

*   **Purpose**: Used as an in-memory data store, primarily for:
    *   **Background Job Queueing**: Managing tasks that can be processed asynchronously, such as sending bulk emails/notifications, generating complex reports, or updating social media data. This is evident from the `workers/` directory (e.g., `flyerWorker.ts`, `notificationWorker.ts`, `reportWorker.ts`, `social-media-update.ts`) and `lib/queue.ts`.
    *   **Caching**: Potentially for caching frequently accessed database queries or API responses to improve performance (though not explicitly stated in README, it's a common use case for Redis).
*   **Configuration (Environment Variables)**:
    *   `REDIS_HOST`
    *   `REDIS_PORT`
    *   `REDIS_PASSWORD`
*   **Library**: `lib/redis.ts` likely contains the Redis client setup and utility functions.
*   **Functionality**:
    *   Enables non-blocking operations for long-running tasks.
    *   Improves application responsiveness by offloading work to background processes.
    *   Helps manage scheduled or recurring tasks.

## 6. The `lib` Directory

The `lib` directory is a crucial part of the project, containing shared utility functions, configurations, constants, and core logic that supports various parts of the application, both on the client and server side.

### 6.1 `lib/api/`

This subdirectory contains utilities specifically for server-side API route handling.
*   **`api-client.ts`**: This seems to be a duplicate or an older version, as `lib/client/api/api-client.ts` is more conventionally placed for a client-side API client. If this server-side `api-client.ts` exists, it might be for server-to-server API communication or a base class.
*   **`auth-middleware.ts`**: Contains middleware functions for authenticating and authorizing API requests. This is likely used in API routes to protect endpoints and ensure the user has the necessary permissions before processing a request. It would integrate with NextAuth.js session data.
*   **`error-boundary.tsx`**: A React component used to catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI. This is more of a frontend utility but might be placed here if it's part of a shared error handling strategy that also logs to the server.
*   **`error-logger.ts`**: A utility for logging errors that occur on the server-side, potentially to a file, a database, or an external error tracking service.
*   **`with-error-handler.ts`**: A higher-order function or wrapper that can be used to wrap API route handlers to provide centralized error handling logic (e.g., logging errors, returning standardized error responses).

### 6.2 `lib/auth.ts`

*   This file likely contains shared authentication-related utility functions that can be used on both the client and server. This might include functions for:
    *   Checking user roles or permissions (though `permissions.ts` also exists).
    *   Helper functions related to NextAuth.js sessions or tokens.
    *   Could be a re-export or an augmentation of functions from `next-auth`.

### 6.3 `lib/client/`

This subdirectory holds code specifically intended for use on the client-side (in the browser).
*   **`lib/client/api/`**:
    *   **`api-client.ts`**: A client-side utility for making requests to the application's backend APIs. It might be a wrapper around `fetch` or a library like Axios, providing a convenient way to call API endpoints, handle request/response boilerplate, and manage things like base URLs or authentication tokens.
    *   **`services/`**: This subdirectory (`lib/client/api/services/`) likely contains client-side service definitions that use the `api-client.ts` to interact with specific API resource groups (e.g., a `memberService.ts` here would handle calls to `/api/members`). This mirrors the backend `services/` directory but for client-side concerns.
*   **`lib/client/auth/`**:
    *   **`auth.ts`**: Client-side authentication utilities, possibly wrappers around NextAuth.js client methods (`signIn`, `signOut`, `useSession`).
    *   **`hooks.ts`**: Custom React hooks related to authentication, for example, a hook to get the current user with extended properties or a hook to check permissions client-side.

### 6.4 `lib/constants.ts`

*   Defines application-wide constants, such as default values, configuration keys, event names, roles (e.g. `GLOBAL_ADMIN`), permissions strings, or any other static values used across the codebase. This helps in avoiding magic strings/numbers and makes maintenance easier.

### 6.5 `lib/db.ts`

*   This file might be a central point for database-related configurations or utility functions, potentially abstracting parts of `mongodb.ts` or `mongoose.ts` from `lib/server/db/`. It could also be an older file or a simplified access point if the main DB logic is in `lib/server/db/`.

### 6.6 `lib/error-handler.ts`

*   Provides global error handling mechanisms. This could include functions for:
    *   Formatting error messages.
    *   Logging errors (client-side or server-side).
    *   Reporting errors to an external service.
    *   Distinguishing between different types of errors.

### 6.7 `lib/mongodb.ts`

*   Likely contains the core MongoDB connection logic using the native MongoDB driver. It would manage the database connection instance and provide a way to access it. This is often used when not relying entirely on an ODM like Mongoose for all database interactions or for specific configurations. (See also `lib/server/db/mongodb.ts` and `lib/server/db/mongoose.ts` which suggest a more structured server-side DB management).

### 6.8 `lib/permissions.ts`

*   Defines the permission system for the application. This could include:
    *   A list of available permissions (e.g., `CREATE_EVENT`, `DELETE_USER`).
    *   Functions to check if a user (based on their roles or direct permissions) has a specific permission.
    *   Utilities to manage roles (like `GLOBAL_ADMIN`, `CENTER_ADMIN`) and their associated permissions.

### 6.9 `lib/queue.ts`

*   Contains the setup and utility functions for interacting with the background job queue, which uses Redis. This would include functions for:
    *   Adding jobs to the queue (e.g., `addNotificationJob`, `addReportJob`).
    *   Potentially, worker process setup if not solely handled in the `workers/` directory.
    *   Interfaces with the Redis client configured in `lib/redis.ts`.

### 6.10 `lib/redis.ts`

*   Manages the connection to the Redis server. It initializes the Redis client and exports it for use by other parts of the application, primarily `lib/queue.ts` and the worker processes.

### 6.11 `lib/server/`

This subdirectory contains code that is exclusively for server-side execution.
*   **`lib/server/auth/`**:
    *   **`adapter.ts`**: The NextAuth.js adapter for MongoDB using Mongoose. This allows NextAuth.js to store user, session, account, and verification token data in MongoDB.
    *   **`config.ts`**: This might be a duplicate or more specific part of the main `auth/config.ts` or `auth.ts` (NextAuth configuration). It could hold server-specific aspects of the auth config.
*   **`lib/server/db/`**:
    *   **`models/`**: This seems to be an older or alternative location for Mongoose models. The primary location is the root `models/` directory. This might contain base model definitions or specific DB utility models.
    *   **`mongodb.ts`**: Server-specific MongoDB connection utility, possibly using the native driver for certain tasks.
    *   **`mongoose.ts`**: Server-specific Mongoose connection utility, responsible for connecting to MongoDB via Mongoose and making the connection available.
    *   **`repositories/`**: Implements the repository pattern for data access. Repositories provide an abstraction layer over data sources (Mongoose models in this case), decoupling business logic from data access logic. Each file here would manage operations for a specific model (e.g., `userRepository.ts`).

### 6.12 `lib/shared/`

Code that can be shared between the client and server.
*   **`lib/shared/types/`**:
    *   **`user.ts`**: Contains TypeScript type definitions related to the User model or user data (including roles like `GLOBAL_ADMIN`), intended for use on both client and server to ensure consistency. Other shared types would also reside here.

### 6.13 `lib/social-media/`

Contains modules for interacting with the APIs of various social media platforms.
*   `api-test.ts`: A utility for testing social media API connections or functions.
*   `facebook-api.ts`, `instagram-api.ts`, `telegram-scraper.ts`, `tiktok-api.ts`, `twitter-api.ts`, `youtube-api.ts`: Individual modules that encapsulate the logic for making API calls, handling authentication, and fetching data from the respective platforms.
*   `follower-tracking.ts`: Logic for tracking follower counts over time, possibly by fetching data periodically and storing it.
*   `platform-api.ts`: Could be a base class or interface that standardizes interactions across different social media platform APIs.

### 6.14 `lib/store.ts`

*   If the application uses a global client-side state management library (like Zustand, Redux, or Jotai), this file would typically contain the store setup, reducers/slices, and actions.

### 6.15 `lib/utils.ts`

*   A collection of general-purpose utility functions that don't fit into a more specific category. This can include functions for:
    *   Date formatting or manipulation.
    *   String operations.
    *   Data transformations.
    *   Validation helpers (though `lib/validations/` is more specific).
    *   Any other helper functions used across the application.

### 6.16 `lib/validations/`

Contains schemas or functions for validating data, likely using a library like Zod or Joi.
*   **`social-media.ts`**: Validation schemas specific to social media account data or API inputs/outputs.
*   Other files in this directory would contain validation rules for different data models or forms (e.g., `authValidations.ts`, `eventValidations.ts`).

## 7. The `services` Directory

The `services` directory centralizes business logic and interactions with external APIs or complex internal operations. These services are typically used by API route handlers and sometimes by other parts of the application (like workers) to perform specific tasks. They help keep the API route handlers lean and focused on request/response handling, while the core logic resides in the services.

Each service file generally corresponds to a specific domain or resource.

*   **`aiService.ts`**:
    *   **Purpose**: Handles all interactions with the Google Gemini AI API.
    *   **Functionality**: Provides methods to send requests to the Gemini API for tasks like content generation, text summarization, or other AI-powered features. It abstracts the direct API calls and manages API key usage.
    *   **Used By**: Any module requiring AI capabilities (e.g., Reports for summarization, Flyers for content suggestions).
    *   **External Integration**: Google Gemini API.

*   **`attendanceService.ts`**:
    *   **Purpose**: Encapsulates business logic related to attendance tracking.
    *   **Functionality**: Contains methods for creating, retrieving, updating, and deleting attendance records. It might also include logic for generating attendance statistics or reports (though some report generation might be offloaded to `reportService.ts` or specific report API endpoints).
    *   **Used By**: `app/api/attendance/` routes, Member module (for displaying attendance), Event module.

*   **`centerService.ts`**:
    *   **Purpose**: Manages business logic for church centers.
    *   **Functionality**: Includes methods for CRUD operations on centers, potentially logic for assigning leaders, linking to clusters, or fetching center-specific data.
    *   **Used By**: `app/api/centers/` routes.

*   **`clusterService.ts`**:
    *   **Purpose**: Manages business logic for clusters (groups of centers or regional groupings).
    *   **Functionality**: Provides methods for CRUD operations on clusters, managing relationships with centers, and assigning cluster leaders.
    *   **Used By**: `app/api/clusters/` routes.

*   **`discipleshipGoalService.ts`**:
    *   **Purpose**: Handles logic related to discipleship goals (scoped at Global, Center, Cluster, etc.).
    *   **Functionality**: Methods for creating, managing, and tracking discipleship goals. May include logic for linking goals to members or tracking progress.
    *   **Used By**: `app/api/discipleship-goals/` routes, Member module (spiritual growth tab).

*   **`emailService.ts`**:
    *   **Purpose**: Manages the sending of emails via Zoho Zeptomail.
    *   **Functionality**: Provides a clean interface for sending various types of emails (welcome, notifications, password resets) using pre-defined or dynamic content. It handles the API interaction with Zeptomail.
    *   **Used By**: Auth module, Notifications module, Event module, Follow-up module.
    *   **External Integration**: Zoho Zeptomail.

*   **`eventService.ts`**:
    *   **Purpose**: Centralizes business logic for event management (scoped as Global or Center).
    *   **Functionality**: Includes methods for CRUD operations on events, managing event registration, linking events to attendance or flyers.
    *   **Used By**: `app/api/events/` routes, `app/(dashboard)/events/event-service.ts` (client-side counterpart).

*   **`flyerService.ts`**:
    *   **Purpose**: Handles logic related to creating and managing flyers.
    *   **Functionality**: Methods for CRUD operations on flyers, program flyers, and flyer templates. May involve interaction with Cloudinary for image aspects and `flyerWorker.ts` for background processing.
    *   **Used By**: `app/api/flyers/`, `app/api/program-flyers/`, `app/api/flyer-templates/` routes, `app/(dashboard)/flyers/flyer-service.ts`.

*   **`followUpService.ts`**:
    *   **Purpose**: Manages business logic for follow-up activities.
    *   **Functionality**: CRUD operations for follow-ups, assigning tasks, updating status, and potentially generating follow-up reports or statistics.
    *   **Used By**: `app/api/follow-ups/` routes, `app/(dashboard)/follow-ups/follow-up-service.ts`.

*   **`memberService.ts`**:
    *   **Purpose**: Encapsulates core business logic for member management.
    *   **Functionality**: Provides methods for CRUD operations on members, managing member relationships (groups, teams), tracking spiritual growth, attendance, etc. This service would be quite extensive given the number of member-related API endpoints.
    *   **Used By**: `app/api/members/` routes.

*   **`notificationService.ts`**:
    *   **Purpose**: Central point for creating and managing notifications (scoped at Global, Center, etc.).
    *   **Functionality**: Logic for creating notifications in the database, determining recipients, and potentially triggering the sending of notifications through various channels (in-app, email, SMS, WhatsApp) by coordinating with other services (`emailService`, `smsService`, `whatsappService`) or pushing jobs to `notificationWorker.ts`.
    *   **Used By**: Many modules when an action requires notifying a user (e.g., new event, follow-up assigned, birthday). `app/api/notifications/` routes. `app/(dashboard)/notifications/notification-service.ts`.

*   **`reportService.ts`**:
    *   **Purpose**: Handles the generation and management of reports.
    *   **Functionality**: Contains logic to query data from various modules, aggregate it, and format it into reports. It may coordinate with `reportWorker.ts` for generating complex reports asynchronously.
    *   **Used By**: `app/api/reports/` (if it exists as a central point) or directly by reporting endpoints within other modules.

*   **`smallGroupService.ts`**:
    *   **Purpose**: Manages business logic for small groups.
    *   **Functionality**: CRUD operations for small groups, managing group members, assigning leaders, and other group-related activities.
    *   **Used By**: `app/api/small-groups/` routes.

*   **`smsService.ts`**:
    *   **Purpose**: Manages the sending of SMS messages via BulkSMS Nigeria.
    *   **Functionality**: Provides an interface to send SMS, handling API interaction with BulkSMS Nigeria.
    *   **Used By**: Notifications module, potentially for alerts or time-sensitive communication.
    *   **External Integration**: BulkSMS Nigeria.

*   **`socialMediaService.ts`**:
    *   **Purpose**: Orchestrates interactions with various social media platforms.
    *   **Functionality**: Likely acts as a facade or higher-level service that utilizes the specific platform API wrappers in `lib/social-media/`. It would manage connecting accounts (scoped as Global or to a Center), fetching analytics, posts, and coordinating updates, possibly with `social-media-update.ts` worker.
    *   **Used By**: `app/api/social-media/` routes.
    *   **External Integration**: Facebook, Instagram, Twitter, YouTube, TikTok, Telegram APIs via `lib/social-media/`.

*   **`teamService.ts`**:
    *   **Purpose**: Manages business logic for teams.
    *   **Functionality**: CRUD operations for teams, managing team members and their roles, assigning leaders, and linking teams to events or responsibilities.
    *   **Used By**: `app/api/teams/` routes.

*   **`whatsappService.ts`**:
    *   **Purpose**: Manages sending messages via the WhatsApp Cloud API.
    *   **Functionality**: Provides an interface to send templated WhatsApp messages, handling the API interaction and template parameterization.
    *   **Used By**: Notifications module, Follow-up module.
    *   **External Integration**: WhatsApp Cloud API.

This layered approach, separating service logic from API route handling, promotes cleaner code, better testability, and easier maintenance.
