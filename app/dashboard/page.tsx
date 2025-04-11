// app/dashboard/page.tsx - Protected dashboard page
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  
  // If not authenticated, redirect to login
  if (!session?.user) {
    redirect("/login");
  }
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">Welcome, {session.user.email}</h2>
        <p className="text-gray-600">You are logged in as: {session.user.role}</p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Your Account Details</h3>
          <p><strong>User ID:</strong> {session.user.id}</p>
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Role:</strong> {session.user.role}</p>
          <p><strong>Permissions:</strong> {session.user.permissions?.join(", ") || "None"}</p>
        </div>
        
        <div className="mt-6">
          <form action={async () => {
            "use server";
            const { signOut } = await import("@/auth");
            await signOut();
          }}>
            <button 
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
