'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, getAttendanceForDate } from '@/lib/data';
import type { Student, AttendanceRecord } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

export default function PrincipalAttendancePage() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord['status']>>(new Map());
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (currentUser) {
      setStudents(getStudents(currentUser.schoolCode));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const records = getAttendanceForDate(currentUser.schoolCode, selectedDate);
      const attendanceMap = new Map<string, AttendanceRecord['status']>();
      records.forEach(record => {
        attendanceMap.set(record.studentId, record.status);
      });
      setAttendance(attendanceMap);
    }
  }, [selectedDate, currentUser]);

  return (
    <>
      <PageHeader
        title="Attendance Overview"
        description="Monitor daily attendance records for the entire school."
      />
      <Card>
        <CardHeader>
          <CardTitle>School-wide Attendance</CardTitle>
          <CardDescription>Select a date to view attendance records.</CardDescription>
          <div className="pt-2">
            <Input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full md:w-1/4"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>
                      <Badge variant={attendance.get(student.id) === 'Present' ? 'default' : (attendance.has(student.id) ? 'destructive' : 'secondary')}>
                        {attendance.get(student.id) || 'Not Marked'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No students found.</TableCell>
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
