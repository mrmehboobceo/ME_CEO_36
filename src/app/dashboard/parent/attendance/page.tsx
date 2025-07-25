'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { getAttendanceForStudent } from '@/lib/data';
import type { AttendanceRecord } from '@/types';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function ParentAttendancePage() {
  const { currentUser } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'Parent' && currentUser.childIds.length > 0) {
      // For simplicity, showing attendance for the first child
      const childId = currentUser.childIds[0];
      const records = getAttendanceForStudent(currentUser.schoolCode, childId);
      setAttendance(records);
    }
  }, [currentUser]);

  return (
    <>
      <PageHeader
        title="Child's Attendance"
        description="Monitor your child's attendance record."
      />
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Showing attendance for {currentUser?.childIds[0] ? `student ID ${currentUser.childIds[0]}` : 'your child'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                        {record.date}
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                          {record.status === 'Present' ? 
                           <CheckCircle className="mr-2 h-4 w-4" /> : 
                           <XCircle className="mr-2 h-4 w-4" />}
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No attendance records found for your child.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
