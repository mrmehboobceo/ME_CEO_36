'use client';

import type { School, User, Principal, Teacher, Student, Parent, AttendanceRecord, FeePayment, LeaveRequest, CurrentUser, UserRole, SchoolCategory } from '@/types';
import { format } from 'date-fns';

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
    if (safeLocalStorageGet('schools') === null) {
        safeLocalStorageSet('schools', []);
        safeLocalStorageSet('users', []);
        safeLocalStorageSet('attendance', []);
        safeLocalStorageSet('fees', []);
        safeLocalStorageSet('leaves', []);
    }
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
    
    // On first registration, seed with example data for the demo
    if (users.length === 0) {
        seedInitialData(data.schoolCode);
    }

    return true;
};

// Seed initial data for a new school
const seedInitialData = (schoolCode: string) => {
    let users: User[] = safeLocalStorageGet('users') || [];

    const teachers: Teacher[] = [
        { id: 'T001', role: 'Teacher', password: 'password', name: 'Mr. Alan Grant', schoolCode, assignedClass: '10-A' },
        { id: 'T002', role: 'Teacher', password: 'password', name: 'Ms. Ellie Sattler', schoolCode, assignedClass: '9-B' },
    ];

    const parents: Parent[] = [
        { id: 'P001', role: 'Parent', password: 'password', name: 'Sarah Connor', schoolCode, childIds: ['S001'] },
        { id: 'P002', role: 'Parent', password: 'password', name: 'John Hammond', schoolCode, childIds: ['S002'] },
    ];
    
    const students: Student[] = [
        { id: 'S001', role: 'Student', password: 'password', name: 'John Connor', schoolCode, class: '10-A', dob: '2008-02-28', fatherName: 'Unknown', bFormNo: '12345', fatherCnic: '35202-1234567-1', nadraVerified: true, parentId: 'P001' },
        { id: 'S002', role: 'Student', password: 'password', name: 'Lex Murphy', schoolCode, class: '9-B', dob: '2009-05-15', fatherName: 'John Hammond', bFormNo: '67890', fatherCnic: '35202-7654321-2', nadraVerified: false, parentId: 'P002' },
    ];
    
    const attendance: AttendanceRecord[] = [
        { studentId: 'S001', date: format(new Date(), 'yyyy-MM-dd'), status: 'Present', markedBy: 'T001' },
        { studentId: 'S002', date: format(new Date(), 'yyyy-MM-dd'), status: 'Absent', markedBy: 'T002' },
    ];

    const fees: FeePayment[] = [
        { studentId: 'S001', amount: 5000, dueDate: '2024-08-10', status: 'Paid', paidOn: '2024-07-25' },
        { studentId: 'S002', amount: 4500, dueDate: '2024-08-10', status: 'Unpaid' },
    ];
    
    const leaves: LeaveRequest[] = [
        { id: 'L001', studentId: 'S002', studentName: "Lex Murphy", date: '2024-07-29', reason: 'Family event.', status: 'Approved' }
    ];

    users = [...users, ...teachers, ...parents, ...students];
    safeLocalStorageSet('users', users);
    safeLocalStorageSet('attendance', attendance);
    safeLocalStorageSet('fees', fees);
    safeLocalStorageSet('leaves', leaves);
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


// --- Data Manipulation Functions ---

// Generate a unique ID for a new student
const generateStudentId = (schoolCode: string) => {
    const students = getStudents(schoolCode);
    const lastId = students.reduce((max, s) => {
        const idNum = parseInt(s.id.replace('S', ''), 10);
        return idNum > max ? idNum : max;
    }, 0);
    return `S${(lastId + 1).toString().padStart(3, '0')}`;
};

export const addStudent = (schoolCode: string, studentData: Omit<Student, 'id' | 'role' | 'schoolCode'>, existingId?: string): boolean => {
    try {
        const users: User[] = safeLocalStorageGet('users') || [];
        const studentId = existingId || generateStudentId(schoolCode);

        if (existingId) { // Update
            const studentIndex = users.findIndex(u => u.id === existingId && u.schoolCode === schoolCode && u.role === 'Student');
            if (studentIndex === -1) return false;
            const existingStudent = users[studentIndex] as Student;
            users[studentIndex] = { ...existingStudent, ...studentData, password: existingStudent.password }; // Keep original password if not updated
        } else { // Add new
            const newStudent: Student = {
                id: studentId,
                role: 'Student',
                schoolCode,
                password: 'password', // Default password
                ...studentData,
            };
            users.push(newStudent);
        }
        
        safeLocalStorageSet('users', users);
        return true;
    } catch (e) {
        console.error("Failed to add or update student", e);
        return false;
    }
};


export const deleteStudent = (schoolCode: string, studentId: string): boolean => {
    try {
        let users: User[] = safeLocalStorageGet('users') || [];
        const initialLength = users.length;
        users = users.filter(u => !(u.id === studentId && u.schoolCode === schoolCode && u.role === 'Student'));
        if (users.length < initialLength) {
            safeLocalStorageSet('users', users);
            // Optionally, also remove related data like attendance, fees, etc.
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to delete student", e);
        return false;
    }
};

export const addTeacher = (schoolCode: string, teacherData: { name: string, email: string, password?: string, assignedClass?: string }, existingId?: string): boolean => {
    try {
        const users: User[] = safeLocalStorageGet('users') || [];
        const teacherId = existingId || teacherData.email;

        if (existingId) { // Update
            const teacherIndex = users.findIndex(u => u.id === existingId && u.schoolCode === schoolCode && u.role === 'Teacher');
            if (teacherIndex === -1) return false;
            const existingTeacher = users[teacherIndex] as Teacher;
            users[teacherIndex] = { ...existingTeacher, name: teacherData.name, assignedClass: teacherData.assignedClass, password: teacherData.password === '******' ? existingTeacher.password : teacherData.password };
        } else { // Add new
            if (users.some(u => u.id === teacherId && u.schoolCode === schoolCode)) return false; // ID already exists
            const newTeacher: Teacher = {
                id: teacherId,
                role: 'Teacher',
                schoolCode,
                name: teacherData.name,
                password: teacherData.password || 'password',
                assignedClass: teacherData.assignedClass,
            };
            users.push(newTeacher);
        }
        
        safeLocalStorageSet('users', users);
        return true;
    } catch (e) {
        console.error("Failed to add or update teacher", e);
        return false;
    }
};

export const deleteTeacher = (schoolCode: string, teacherId: string): boolean => {
     try {
        let users: User[] = safeLocalStorageGet('users') || [];
        const initialLength = users.length;
        users = users.filter(u => !(u.id === teacherId && u.schoolCode === schoolCode && u.role === 'Teacher'));
        if (users.length < initialLength) {
            safeLocalStorageSet('users', users);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to delete teacher", e);
        return false;
    }
}

// --- Attendance ---
export const getAttendanceForStudent = (schoolCode: string, studentId: string): AttendanceRecord[] => {
    const attendance: AttendanceRecord[] = safeLocalStorageGet('attendance') || [];
    return attendance.filter(a => a.studentId === studentId); // Assuming studentId is unique across schools for this getter
};

export const getAttendanceForDate = (schoolCode: string, date: string): AttendanceRecord[] => {
    const attendance: AttendanceRecord[] = safeLocalStorageGet('attendance') || [];
    const students = getStudents(schoolCode);
    const studentIds = students.map(s => s.id);
    return attendance.filter(a => a.date === date && studentIds.includes(a.studentId));
};

export const markAttendance = (schoolCode: string, teacherId: string, records: Omit<AttendanceRecord, 'markedBy'>[]): boolean => {
    try {
        let attendance: AttendanceRecord[] = safeLocalStorageGet('attendance') || [];
        records.forEach(record => {
            const index = attendance.findIndex(a => a.studentId === record.studentId && a.date === record.date);
            if (index !== -1) {
                attendance[index] = { ...record, markedBy: teacherId };
            } else {
                attendance.push({ ...record, markedBy: teacherId });
            }
        });
        safeLocalStorageSet('attendance', attendance);
        return true;
    } catch (e) {
        console.error("Failed to mark attendance", e);
        return false;
    }
};


// --- Fee Management ---
export const getFeePayments = (schoolCode: string): FeePayment[] => {
    const fees: FeePayment[] = safeLocalStorageGet('fees') || [];
    const students = getStudents(schoolCode);
    const studentIds = students.map(s => s.id);
    return fees.filter(f => studentIds.includes(f.studentId));
};

export const getFeesForStudent = (schoolCode: string, studentId: string): FeePayment[] => {
    const fees = getFeePayments(schoolCode);
    return fees.filter(f => f.studentId === studentId);
};

export const updateFeePaymentStatus = (schoolCode: string, studentId: string, dueDate: string, status: 'Paid' | 'Unpaid', paidOn?: string): boolean => {
    try {
        let fees: FeePayment[] = safeLocalStorageGet('fees') || [];
        const feeIndex = fees.findIndex(f => f.studentId === studentId && f.dueDate === dueDate);
        if (feeIndex !== -1) {
            fees[feeIndex].status = status;
            fees[feeIndex].paidOn = paidOn;
            safeLocalStorageSet('fees', fees);
            return true;
        }
        return false;
    } catch(e) {
        console.error("Failed to update fee status", e);
        return false;
    }
};


// --- Leave Management ---
const generateLeaveId = () => `L${Date.now()}`;

export const getLeaveRequests = (schoolCode: string): LeaveRequest[] => {
    const leaves: LeaveRequest[] = safeLocalStorageGet('leaves') || [];
    // In a real app, you'd filter by school, but for now, we assume leave IDs are unique
    return leaves;
};

export const getLeaveRequestsForStudent = (schoolCode: string, studentId: string): LeaveRequest[] => {
    const leaves = getLeaveRequests(schoolCode);
    return leaves.filter(l => l.studentId === studentId);
};

export const getLeaveRequestsForClass = (schoolCode: string, className: string): LeaveRequest[] => {
    const leaves = getLeaveRequests(schoolCode);
    const studentsInClass = getStudents(schoolCode).filter(s => s.class === className).map(s => s.id);
    return leaves.filter(l => studentsInClass.includes(l.studentId));
};

export const addLeaveRequest = (schoolCode: string, data: { studentId: string; studentName: string; date: string; reason: string }): boolean => {
    try {
        const leaves: LeaveRequest[] = safeLocalStorageGet('leaves') || [];
        const newRequest: LeaveRequest = {
            ...data,
            id: generateLeaveId(),
            status: 'Pending',
        };
        leaves.push(newRequest);
        safeLocalStorageSet('leaves', leaves);
        return true;
    } catch (e) {
        console.error("Failed to add leave request", e);
        return false;
    }
};

export const updateLeaveStatus = (schoolCode: string, leaveId: string, status: 'Approved' | 'Rejected'): boolean => {
    try {
        let leaves: LeaveRequest[] = safeLocalStorageGet('leaves') || [];
        const leaveIndex = leaves.findIndex(l => l.id === leaveId);
        if (leaveIndex !== -1) {
            leaves[leaveIndex].status = status;
            safeLocalStorageSet('leaves', leaves);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to update leave status", e);
        return false;
    }
};
