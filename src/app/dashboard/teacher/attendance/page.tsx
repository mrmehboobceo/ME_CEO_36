'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherAttendancePage() {
  return (
    <>
      <PageHeader
        title="Mark Attendance"
        description="Mark daily attendance for your assigned class."
      />
      <Card>
        <CardHeader>
          <CardTitle>Class Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Teachers will be able to mark student attendance here.</p>
        </CardContent>
      </Card>
    </>
  );
}
