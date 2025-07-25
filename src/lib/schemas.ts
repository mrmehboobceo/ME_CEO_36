import { z } from 'zod';

export const registerSchema = z.object({
  schoolName: z.string().min(3, 'School name must be at least 3 characters'),
  schoolCategory: z.enum(['Government', 'PEF', 'Private', 'Academy']),
  principalName: z.string().min(3, 'Principal name must be at least 3 characters'),
  principalEmail: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  schoolCode: z.string().min(4, 'School code must be at least 4 characters'),
});

export const loginSchema = z.object({
  schoolCode: z.string().min(1, 'School code is required'),
  role: z.enum(['Principal', 'Teacher', 'Student', 'Parent']),
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
});

export const addStudentSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    class: z.string().min(1, { message: "Class is required." }),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
    fatherName: z.string().min(3, { message: "Father's name must be at least 3 characters." }),
    bFormNo: z.string().optional(),
    fatherCnic: z.string().regex(/^\d{5}-\d{7}-\d{1}$/, { message: "Invalid CNIC format (e.g., 12345-1234567-1)" }),
    nadraVerified: z.boolean().default(false),
    photoUrl: z.any().optional(),
    parentId: z.string().min(1, { message: "Parent ID is required." }),
    password: z.string().min(4, { message: "Password must be at least 4 characters."}),
});

export const addTeacherSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters." }),
    id: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    assignedClass: z.string().optional(),
});

export const leaveRequestSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  reason: z.string().min(10, { message: "Reason must be at least 10 characters." }),
});

export const notificationSchema = z.object({
    userRole: z.enum(['Principal', 'Teacher', 'Student', 'Parent']),
    userId: z.string().min(1, { message: "Please select a recipient." }),
});
