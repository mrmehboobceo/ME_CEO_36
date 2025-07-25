export type UserRole = 'Principal' | 'Teacher' | 'Student' | 'Parent';

export type SchoolCategory = 'Government' | 'PEF' | 'Private' | 'Academy';

export interface School {
  name: string;
  category: SchoolCategory;
  code: string;
}

export interface User {
  id: string; // email for principal, generated for others
  role: UserRole;
  password?: string;
  name: string;
  schoolCode: string;
}

export interface Principal extends User {
  role: 'Principal';
}

export interface Teacher extends User {
  role: 'Teacher';
  assignedClass?: string;
  id: string; // Teacher ID
}

export interface Student extends User {
  role: 'Student';
  class: string;
  dob: string;
  fatherName: string;
  bFormNo: string;
  fatherCnic: string;
  nadraVerified: boolean;
  photoUrl?: string;
  parentId: string; // Parent's User ID
  id: string; // Student ID
}

export interface Parent extends User {
  role: 'Parent';
  childIds: string[];
  id: string; // Parent ID
}

export type CurrentUser = (Principal | Teacher | Student | Parent) & { schoolName: string };

export interface AttendanceRecord {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent';
  markedBy: string; // Teacher ID
}

export interface FeePayment {
  studentId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: 'Paid' | 'Unpaid';
  paidOn?: string; // YYYY-MM-DD
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  date: string; // YYYY-MM-DD
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AppNotification {
  id: string;
  userId: string; // ID of user to receive notification
  message: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  read: boolean;
  createdAt: string;
}
