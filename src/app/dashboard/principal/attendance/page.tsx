'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrincipalAttendancePage() {
  return (
    <>
      <PageHeader
        title="Attendance Overview"
        description="Monitor daily and monthly attendance records for the entire school."
      />
      <Card>
        <CardHeader>
          <CardTitle>School-wide Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Principal-specific attendance tracking features will be available here soon.</p>
        </CardContent>
      </Card>
    </>
  );
}
