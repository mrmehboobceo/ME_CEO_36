'use server';

/**
 * @fileOverview Personalized notification AI agent.
 *
 * - generatePersonalizedNotification - A function that handles the generation of personalized notifications.
 * - PersonalizedNotificationInput - The input type for the generatePersonalizedNotification function.
 * - PersonalizedNotificationOutput - The return type for the generatePersonalizedNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedNotificationInputSchema = z.object({
  userRole: z.enum(['Principal', 'Teacher', 'Student', 'Parent']).describe('The role of the user.'),
  userId: z.string().describe('The ID of the user.'),
  userName: z.string().describe('The name of the user.'),
  attendanceRecords: z.array(z.object({
    date: z.string(),
    status: z.enum(['Present', 'Absent']),
  })).optional().describe('Attendance records of the user, if applicable.'),
  feePaymentStatus: z.enum(['Paid', 'Unpaid']).optional().describe('Fee payment status of the user, if applicable.'),
  generalAnnouncements: z.array(z.string()).optional().describe('General announcements to be communicated.'),
  parentName: z.string().optional().describe('The name of the parent, if applicable.'),
  childName: z.string().optional().describe('The name of the child, if applicable.'),
  childAttendanceRecords: z.array(z.object({
    date: z.string(),
    status: z.enum(['Present', 'Absent']),
  })).optional().describe('Attendance records of the child, if applicable.'),
  childFeePaymentStatus: z.enum(['Paid', 'Unpaid']).optional().describe('Fee payment status of the child, if applicable.'),
});

export type PersonalizedNotificationInput = z.infer<typeof PersonalizedNotificationInputSchema>;

const PersonalizedNotificationOutputSchema = z.object({
  notificationType: z.string().describe('The type of notification (e.g., Absence Alert, Fee Reminder, General Announcement).'),
  message: z.string().describe('The personalized notification message.'),
  channel: z.enum(['SMS', 'Email', 'WhatsApp']).describe('The preferred channel for the notification.'),
});

export type PersonalizedNotificationOutput = z.infer<typeof PersonalizedNotificationOutputSchema>;

export async function generatePersonalizedNotification(input: PersonalizedNotificationInput): Promise<PersonalizedNotificationOutput> {
  return personalizedNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedNotificationPrompt',
  input: {schema: PersonalizedNotificationInputSchema},
  output: {schema: PersonalizedNotificationOutputSchema},
  prompt: `You are an AI assistant designed to generate personalized notifications for a school management system.

  Based on the user's role, attendance records, fee payment status, and general announcements, create a personalized notification message.
  Consider the following:

  - For parents, prioritize notifications about their child's attendance and fee payment status.
  - For students, prioritize notifications about attendance, fee due date and general school announcements.
  - For teachers, share information about class assignments, school notices and any urgent requests.
  - For principals, provide summaries of daily events and information needed.

  Here's the user's information:
  Role: {{{userRole}}}
  User ID: {{{userId}}}
  User Name: {{{userName}}}
  {{~#if parentName}}Parent Name: {{{parentName}}}{{/if}}
  {{~#if childName}}Child Name: {{{childName}}}{{/if}}
  {{~#if attendanceRecords}}Attendance Records:{{#each attendanceRecords}} Date: {{{date}}}, Status: {{{status}}}{{/each}}{{/if}}
  {{~#if childAttendanceRecords}}Child Attendance Records:{{#each childAttendanceRecords}} Date: {{{date}}}, Status: {{{status}}}{{/each}}{{/if}}
  {{~#if feePaymentStatus}}Fee Payment Status: {{{feePaymentStatus}}}{{/if}}
  {{~#if childFeePaymentStatus}}Child Fee Payment Status: {{{childFeePaymentStatus}}}{{/if}}
  {{~#if generalAnnouncements}}General Announcements:{{#each generalAnnouncements}}} {{{this}}}{{/each}}{{/if}}

  Generate a concise and relevant notification message. Choose the most appropriate channel (SMS, Email, or WhatsApp) based on the notification type.
  `,
});

const personalizedNotificationFlow = ai.defineFlow(
  {
    name: 'personalizedNotificationFlow',
    inputSchema: PersonalizedNotificationInputSchema,
    outputSchema: PersonalizedNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
