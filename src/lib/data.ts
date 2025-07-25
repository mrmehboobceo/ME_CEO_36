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
    // This function will no longer seed data by default.
    // It will be seeded upon first registration.
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
    
    let users: User[] = safeLocalStorageGet('users') || [];

    // Seed data only on the very first registration.
    if (schools.length === 0) {
        const teachers: Teacher[] = [
            { id: 'T001', role: 'Teacher', password: 'password', name: 'Mr. Alan Grant', schoolCode: data.schoolCode, assignedClass: '10-A' },
            { id: 'T002', role: 'Teacher', password: 'password', name: 'Ms. Ellie Sattler', schoolCode: data.schoolCode, assignedClass: '9-B' },
        ];

        const parents: Parent[] = [
            { id: 'P001', role: 'Parent', password: 'password', name: 'Sarah Connor', schoolCode: data.schoolCode, childIds: ['S001'] },
            { id: 'P002', role: 'Parent', password: 'password', name: 'John Hammond', schoolCode: data.schoolCode, childIds: ['S002'] },
        ];
        
        const students: Student[] = [
            { id: 'S001', role: 'Student', password: 'password', name: 'John Connor', schoolCode: data.schoolCode, class: '10-A', dob: '2008-02-28', fatherName: 'Unknown', bFormNo: '12345', fatherCnic: '35202-1234567-1', nadraVerified: true, parentId: 'P001' },
            { id: 'S002', role: 'Student', password: 'password', name: 'Lex Murphy', schoolCode: data.schoolCode, class: '9-B', dob: '2009-05-15', fatherName: 'John Hammond', bFormNo: '67890', fatherCnic: '35202-7654321-2', nadraVerified: false, parentId: 'P002' },
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

        users = [...users, ...teachers, ...parents, ...students];
        safeLocalStorageSet('attendance', attendance);
        safeLocalStorageSet('fees', fees);
        safeLocalStorageSet('leaves', leaves);
    }
    
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

// Generate a unique ID for a new teacher
const generateTeacherId = (schoolCode: string) => {
    const teachers = getTeachers(schoolCode);
    const lastId = teachers.reduce((max, t) => {
        const idNum = parseInt(t.id.replace('T', ''), 10);
        return idNum > max ? idNum : max;
    }, 0);
    return `T${(lastId + 1).toString().padStart(3, '0')}`;
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
