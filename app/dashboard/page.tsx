// app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  // Protect this page - redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {session.user.email}</h2>
        <p className="text-gray-600">You are logged in as: {session.user.role}</p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Your Account Details:</h3>
          <ul className="space-y-1 text-sm">
            <li><span className="font-medium">User ID:</span> {session.user.id}</li>
            <li><span className="font-medium">Email:</span> {session.user.email}</li>
            <li><span className="font-medium">Role:</span> {session.user.role}</li>
            <li>
              <span className="font-medium">Permissions:</span>{" "}
              {session.user.permissions?.length 
                ? session.user.permissions.join(", ") 
                : "No special permissions"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
