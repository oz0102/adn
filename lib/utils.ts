import { format, parseISO } from 'date-fns';
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatDateTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'MMM dd, yyyy h:mm a');
}

export function formatTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'h:mm a');
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName?: string): string {
  if (!firstName) return '';
  
  if (lastName) {
    // If both first and last name are provided
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else {
    // If only one name parameter is provided (could be full name with space)
    return firstName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

export function generateMemberId(firstName: string, lastName: string, count: number): string {
  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();
  const paddedCount = String(count).padStart(4, '0');
  
  return `${firstInitial}${lastInitial}${paddedCount}`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'sent':
    case 'achieved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500';
    case 'pending':
    case 'in progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500';
    case 'inactive':
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500';
  }
}

export function calculateAge(dateOfBirth: Date | string): number {
  if (!dateOfBirth) return 0;
  
  const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
