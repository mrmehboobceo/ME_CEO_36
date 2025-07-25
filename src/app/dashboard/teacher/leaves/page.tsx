'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLeaveRequestsForClass } from '@/lib/data';
import type { LeaveRequest, Teacher } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function TeacherLeavesPage() {
  const { currentUser } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  
  const assignedClass = (currentUser as Teacher)?.assignedClass;
  
  useEffect(() => {
    if (currentUser && assignedClass) {
      setLeaveRequests(getLeaveRequestsForClass(currentUser.schoolCode, assignedClass));
    }
  }, [currentUser, assignedClass]);
  
  if (!assignedClass) {
    return (
       <>
        <PageHeader title="Student Leave Requests" />
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You are not assigned to a class, so you cannot see leave requests.</p>
            </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Student Leave Requests"
        description={`View leave requests from students in your class: ${assignedClass}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            These are the leave applications submitted by students in your class. They must be approved by the principal.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.length > 0 ? leaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.studentName}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'Approved' ? 'default' : request.status === 'Rejected' ? 'destructive' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No leave requests found for your class.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
