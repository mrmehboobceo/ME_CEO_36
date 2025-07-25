'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getLeaveRequests, updateLeaveStatus } from '@/lib/data';
import type { LeaveRequest } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PrincipalLeavesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const fetchLeaveRequests = () => {
    if (currentUser) {
      setLeaveRequests(getLeaveRequests(currentUser.schoolCode));
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [currentUser]);

  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    if (!currentUser) return;
    const success = updateLeaveStatus(currentUser.schoolCode, id, status);
    if (success) {
      toast({
        title: 'Request Updated',
        description: `Leave request has been ${status.toLowerCase()}.`
      });
      fetchLeaveRequests();
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the leave request status.'
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Leave Requests"
        description="Review and approve or reject leave requests from all students."
      />
      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
          <CardDescription>All student leave applications appear here.</CardDescription>
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
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right space-x-2">
                      {request.status === 'Pending' && (
                        <>
                          <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(request.id, 'Approved')}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleUpdateStatus(request.id, 'Rejected')}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No leave requests found.</TableCell>
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
