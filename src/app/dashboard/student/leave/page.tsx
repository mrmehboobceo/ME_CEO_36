'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { addLeaveRequest, getLeaveRequestsForStudent } from '@/lib/data';
import { leaveRequestSchema } from '@/lib/schemas';
import type { LeaveRequest } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function StudentLeavePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      reason: '',
    },
  });
  
  const fetchLeaveHistory = () => {
    if (currentUser) {
        setLeaveHistory(getLeaveRequestsForStudent(currentUser.schoolCode, currentUser.id));
    }
  }

  useEffect(() => {
    fetchLeaveHistory();
  }, [currentUser]);

  const onSubmit = (data: z.infer<typeof leaveRequestSchema>) => {
    if (!currentUser) return;
    setIsLoading(true);

    const success = addLeaveRequest(currentUser.schoolCode, {
      studentId: currentUser.id,
      studentName: currentUser.name,
      date: format(data.date, 'yyyy-MM-dd'),
      reason: data.reason
    });

    if (success) {
      toast({
        title: 'Request Submitted',
        description: 'Your leave application has been sent for approval.'
      });
      form.reset();
      fetchLeaveHistory();
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your leave application. Please try again.'
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <PageHeader
        title="Apply for Leave"
        description="Submit a leave request for absence."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New Leave Application</CardTitle>
            <CardDescription>Fill out the form to request a day off.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Absence</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reason for Leave</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Family event, medical appointment, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                 <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card>
           <CardHeader>
            <CardTitle>Application History</CardTitle>
            <CardDescription>A record of your past leave requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveHistory.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaveHistory.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>{req.date}</TableCell>
                                <TableCell className="truncate max-w-[150px]">{req.reason}</TableCell>
                                <TableCell>
                                    <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p className="text-center text-muted-foreground py-10">You haven't applied for any leave yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
