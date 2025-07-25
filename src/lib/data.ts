'use client';

import type { School, User, Principal, Teacher, Student, Parent, AttendanceRecord, FeePayment, LeaveRequest, CurrentUser, UserRole, SchoolCategory } from '@/types';

// Helper to safely access localStorage
const safeLocalStorageGet = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
};

const safeLocalStorageSet = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// --- Data Initialization ---

const initializeData = () => {
    // Check if data is already initialized
    if (safeLocalStorageGet('schools')) return;

    const school: School = { name: 'Greenwood High', category: 'Private', code: 'GHS101' };
    
    const principal: Principal = { id: 'principal@ghs.com', role: 'Principal', password: 'password', name: 'Dr. Evelyn Reed', schoolCode: 'GHS101' };
    
    const teachers: Teacher[] = [
        { id: 'T001', role: 'Teacher', password: 'password', name: 'Mr. Alan Grant', schoolCode: 'GHS101', assignedClass: '10-A' },
        { id: 'T002', role: 'Teacher', password: 'password', name: 'Ms. Ellie Sattler', schoolCode: 'GHS101', assignedClass: '9-B' },
    ];

    const parents: Parent[] = [
        { id: 'P001', role: 'Parent', password: 'password', name: 'Sarah Connor', schoolCode: 'GHS101', childIds: ['S001'] },
        { id: 'P002', role: 'Parent', password: 'password', name: 'John Hammond', schoolCode: 'GHS101', childIds: ['S002'] },
    ];
    
    const students: Student[] = [
        { id: 'S001', role: 'Student', password: 'password', name: 'John Connor', schoolCode: 'GHS101', class: '10-A', dob: '2008-02-28', fatherName: 'Unknown', bFormNo: '12345', fatherCnic: '35202-1234567-1', nadraVerified: true, parentId: 'P001' },
        { id: 'S002', role: 'Student', password: 'password', name: 'Lex Murphy', schoolCode: 'GHS101', class: '9-B', dob: '2009-05-15', fatherName: 'John Hammond', bFormNo: '67890', fatherCnic: '35202-7654321-2', nadraVerified: false, parentId: 'P002' },
    ];
    
    const attendance: AttendanceRecord[] = [
        { studentId: 'S001', date: '2024-07-28', status: 'Present', markedBy: 'T001' },
        { studentId: 'S002', date: '2024-07-28', status: 'Absent', markedBy: 'T002' },
    ];

    const fees: FeePayment[] = [
        { studentId: 'S001', amount: 5000, dueDate: '2024-08-10', status: 'Paid', paidOn: '2024-07-25' },
        { studentId: 'S002', amount: 4500, dueDate: '2024-08-10', status: 'Unpaid' },
    ];
    
    const leaves: LeaveRequest[] = [
        { id: 'L001', studentId: 'S002', studentName: "Lex Murphy", date: '2024-07-29', reason: 'Family event.', status: 'Approved' }
    ];

    safeLocalStorageSet('schools', [school]);
    safeLocalStorageSet('users', [principal, ...teachers, ...parents, ...students]);
    safeLocalStorageSet('attendance', attendance);
    safeLocalStorageSet('fees', fees);
    safeLocalStorageSet('leaves', leaves);
};

// Initialize data on first load
if (typeof window !== 'undefined') {
  initializeData();
}

// --- Auth Functions ---
export type RegistrationData = { schoolName: string, schoolCategory: SchoolCategory, principalName: string, principalEmail: string, password: string, schoolCode: string };
export const registerSchoolAndPrincipal = (data: RegistrationData): boolean => {
    const schools: School[] = safeLocalStorageGet('schools') || [];
    if (schools.some(s => s.code === data.schoolCode)) {
        return false; // School code already exists
    }
    const newSchool: School = { name: data.schoolName, category: data.schoolCategory, code: data.schoolCode };
    const newPrincipal: Principal = { id: data.principalEmail, name: data.principalName, password: data.password, role: 'Principal', schoolCode: data.schoolCode };
    
    safeLocalStorageSet('schools', [...schools, newSchool]);
    const users: User[] = safeLocalStorageGet('users') || [];
    safeLocalStorageSet('users', [...users, newPrincipal]);
    return true;
};

export type LoginCredentials = { schoolCode: string, role: UserRole, userId: string, password: string };
export const loginUser = (credentials: LoginCredentials): User | null => {
    const users: User[] = safeLocalStorageGet('users') || [];
    const user = users.find(u =>
        u.schoolCode === credentials.schoolCode &&
        u.role === credentials.role &&
        u.id === credentials.userId &&
        u.password === credentials.password
    );
    return user || null;
};

// --- Data Getters ---
export const getSchoolByCode = (code: string): School | null => {
    const schools: School[] = safeLocalStorageGet('schools') || [];
    return schools.find(s => s.code === code) || null;
};

export const getStudents = (schoolCode: string): Student[] => {
    const users: User[] = safeLocalStorageGet('users') || [];
    return users.filter(u => u.schoolCode === schoolCode && u.role === 'Student') as Student[];
};

export const getStudentById = (schoolCode: string, studentId: string): Student | null => {
    return getStudents(schoolCode).find(s => s.id === studentId) || null;
};

export const getTeachers = (schoolCode: string): Teacher[] => {
    const users: User[] = safeLocalStorageGet('users') || [];
    return users.filter(u => u.schoolCode === schoolCode && u.role === 'Teacher') as Teacher[];
};

export const getParents = (schoolCode: string): Parent[] => {
    const users: User[] = safeLocalStorageGet('users') || [];
    return users.filter(u => u.schoolCode === schoolCode && u.role === 'Parent') as Parent[];
};

export const getDailyAttendancePercentage = (schoolCode: string): number => {
    const today = new Date().toISOString().split('T')[0];
    const students = getStudents(schoolCode);
    if (students.length === 0) return 100;

    const attendance: AttendanceRecord[] = safeLocalStorageGet('attendance') || [];
    const todayAttendance = attendance.filter(a => students.some(s => s.id === a.studentId) && a.date === today);
    const presentCount = todayAttendance.filter(a => a.status === 'Present').length;
    
    if (todayAttendance.length === 0) return 0; // Or handle as "not marked yet"
    return Math.round((presentCount / todayAttendance.length) * 100);
}
