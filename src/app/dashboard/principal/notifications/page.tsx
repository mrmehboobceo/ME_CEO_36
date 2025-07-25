'use client';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/dashboard/shared/page-header';
import type { PersonalizedNotificationInput, PersonalizedNotificationOutput } from '@/ai/flows/personalized-notifications';
import { generatePersonalizedNotification } from '@/ai/flows/personalized-notifications';
import { getStudents, getTeachers, getParents, getStudentById, getAttendanceForStudent, getFeesForStudent } from '@/lib/data';
import { notificationSchema } from '@/lib/schemas';
import { Loader2, Wand2, MessageSquare } from 'lucide-react';
import type { AttendanceRecord, FeePayment } from '@/types';

type UserOption = { value: string; label: string; role: 'Student' | 'Teacher' | 'Parent' };

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNotification, setGeneratedNotification] = useState<PersonalizedNotificationOutput | null>(null);

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      userRole: 'Parent',
      userId: '',
    },
  });

  const selectedRole = useWatch({ control: form.control, name: 'userRole' });

  const getUsersForRole = (role: 'Principal' | 'Teacher' | 'Student' | 'Parent'): UserOption[] => {
    if (!currentUser) return [];
    switch (role) {
      case 'Student':
        return getStudents(currentUser.schoolCode).map(s => ({ value: s.id, label: `${s.name} (Class ${s.class})`, role: 'Student' }));
      case 'Teacher':
        return getTeachers(currentUser.schoolCode).map(t => ({ value: t.id, label: t.name, role: 'Teacher' }));
      case 'Parent':
        return getParents(currentUser.schoolCode).map(p => ({ value: p.id, label: p.name, role: 'Parent' }));
      default:
        return [];
    }
  };

  const userOptions = getUsersForRole(selectedRole);

  const onSubmit = async (data: z.infer<typeof notificationSchema>) => {
    setIsLoading(true);
    setGeneratedNotification(null);

    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Not authenticated.' });
        setIsLoading(false);
        return;
    }

    const userName = userOptions.find(u => u.value === data.userId)?.label || '';

    const input: PersonalizedNotificationInput = {
      userRole: data.userRole,
      userId: data.userId,
      userName: userName,
      generalAnnouncements: ["The school will be closed for the summer festival next Friday."],
    };

    let student;
    if (data.userRole === 'Parent') {
        const parent = getParents(currentUser.schoolCode).find(p => p.id === data.userId);
        if (parent?.childIds.length) {
            student = getStudentById(currentUser.schoolCode, parent.childIds[0]);
            if(student) {
                const attendance = getAttendanceForStudent(currentUser.schoolCode, student.id);
                const fees = getFeesForStudent(currentUser.schoolCode, student.id);
                const lastFee = fees[fees.length - 1];

                input.childName = student.name;
                input.childAttendanceRecords = attendance.slice(-5).map(a => ({date: a.date, status: a.status})); // last 5 records
                if (lastFee) {
                    input.childFeePaymentStatus = lastFee.status;
                }
            }
        }
    } else if(data.userRole === 'Student') {
        student = getStudentById(currentUser.schoolCode, data.userId);
         if(student) {
            const attendance = getAttendanceForStudent(currentUser.schoolCode, student.id);
            const fees = getFeesForStudent(currentUser.schoolCode, student.id);
            const lastFee = fees[fees.length - 1];

            input.attendanceRecords = attendance.slice(-5).map(a => ({date: a.date, status: a.status}));
            if (lastFee) {
                input.feePaymentStatus = lastFee.status;
            }
        }
    }
    

    try {
      const result = await generatePersonalizedNotification(input);
      setGeneratedNotification(result);
      toast({
        title: 'Notification Generated!',
        description: 'Review the message below and send it.',
      });
    } catch (error) {
      console.error('AI notification generation failed:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the notification. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendNotification = () => {
    if (generatedNotification) {
      // This is a simulation. In a real app, you'd use a service to send the message.
      const phone = '1234567890'; // Mock phone number
      if (generatedNotification.channel === 'WhatsApp') {
         window.open(`https://wa.me/${phone}?text=${encodeURIComponent(generatedNotification.message)}`);
      } else if (generatedNotification.channel === 'SMS') {
         window.open(`sms:${phone}?body=${encodeURIComponent(generatedNotification.message)}`);
      } else {
        toast({ title: 'Simulated Email', description: `An email has been "sent" with the message:\n\n${generatedNotification.message}`});
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Smart Notification Tool"
        description="Use AI to craft personalized notifications for parents, students, and teachers."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Notification</CardTitle>
            <CardDescription>Select a user and let the AI generate a relevant message.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="userRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Role</FormLabel>
                      <Select onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('userId', '');
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedRole}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a recipient" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                  Generate Message
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className={!generatedNotification && !isLoading ? 'flex items-center justify-center' : ''}>
          <CardHeader>
            <CardTitle>Generated Message</CardTitle>
            <CardDescription>Review the AI-generated message before sending.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[150px]">
            {isLoading && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {!isLoading && !generatedNotification && <p className="text-muted-foreground text-center">Your generated message will appear here.</p>}
            {generatedNotification && (
              <div className="space-y-4">
                <div>
                    <FormLabel>Channel</FormLabel>
                    <p className="font-mono text-sm p-2 bg-muted rounded-md">{generatedNotification.channel}</p>
                </div>
                <div>
                    <FormLabel>Message</FormLabel>
                    <Textarea value={generatedNotification.message} readOnly rows={5} className="bg-muted"/>
                </div>
              </div>
            )}
          </CardContent>
          {generatedNotification && (
             <CardFooter>
                <Button onClick={sendNotification}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Simulate Sending via {generatedNotification.channel}
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
