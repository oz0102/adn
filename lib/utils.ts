import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Active':
    case 'Completed':
    case 'Published':
    case 'Present':
    case 'Successful':
      return 'bg-green-100 text-green-800';
    case 'Pending':
    case 'In Progress':
    case 'Draft':
      return 'bg-blue-100 text-blue-800';
    case 'Inactive':
    case 'Failed':
    case 'Archived':
    case 'Absent':
    case 'Declined':
      return 'bg-red-100 text-red-800';
    case 'Excused':
    case 'Rescheduled':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'Admin':
      return 'bg-purple-100 text-purple-800';
    case 'Pastor':
      return 'bg-indigo-100 text-indigo-800';
    case 'ClusterLead':
      return 'bg-blue-100 text-blue-800';
    case 'SmallGroupLead':
      return 'bg-green-100 text-green-800';
    case 'TeamLead':
      return 'bg-yellow-100 text-yellow-800';
    case 'MediaTeam':
      return 'bg-pink-100 text-pink-800';
    case 'Member':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
