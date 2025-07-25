'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, getAttendanceForDate, markAttendance } from '@/lib/data';
import type { Student, Teacher, AttendanceRecord } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function TeacherAttendancePage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Map<string, 'Present' | 'Absent'>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const assignedClass = (currentUser as Teacher)?.assignedClass;

  useEffect(() => {
    if (currentUser && assignedClass) {
      const allStudents = getStudents(currentUser.schoolCode);
      const classStudents = allStudents.filter(s => s.class === assignedClass);
      setStudents(classStudents);

      const existingAttendance = getAttendanceForDate(currentUser.schoolCode, today);
      const attendanceMap = new Map<string, 'Present' | 'Absent'>();
      existingAttendance.forEach(record => {
        if(classStudents.some(s => s.id === record.studentId)) {
            attendanceMap.set(record.studentId, record.status);
        }
      });
      setAttendance(attendanceMap);
    }
  }, [currentUser, assignedClass, today]);

  const handleAttendanceChange = (studentId: string, status: 'Present' | 'Absent') => {
    setAttendance(prev => new Map(prev).set(studentId, status));
  };

  const handleSubmit = () => {
    if (!currentUser) return;
    setIsLoading(true);

    const recordsToSave: Omit<AttendanceRecord, 'markedBy'>[] = [];
    students.forEach(student => {
      const status = attendance.get(student.id);
      if (status) {
        recordsToSave.push({ studentId: student.id, date: today, status });
      }
    });

    const success = markAttendance(currentUser.schoolCode, currentUser.id, recordsToSave);
    
    if (success) {
      toast({
        title: 'Attendance Saved!',
        description: `Attendance for class ${assignedClass} has been successfully recorded for ${today}.`
      });
    } else {
       toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save attendance. Please try again.'
      });
    }

    setIsLoading(false);
  };

  if (!assignedClass) {
    return (
       <>
        <PageHeader title="Mark Attendance" />
        <Card>
            <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">You are not assigned to a class. Please contact the school principal.</p>
            </CardContent>
        </Card>
      </>
    )
  }


  return (
    <>
      <PageHeader
        title="Mark Attendance"
        description={`Mark daily attendance for your assigned class: ${assignedClass}`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance for {today}</CardTitle>
          <CardDescription>Select the status for each student in your class.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono">{student.id}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <RadioGroup
                        value={attendance.get(student.id) || ''}
                        onValueChange={(value) => handleAttendanceChange(student.id, value as 'Present' | 'Absent')}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Present" id={`present-${student.id}`} />
                          <Label htmlFor={`present-${student.id}`}>Present</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Absent" id={`absent-${student.id}`} />
                          <Label htmlFor={`absent-${student.id}`}>Absent</Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Attendance
            </Button>
        </CardFooter>
      </Card>
    </>
  );
}
