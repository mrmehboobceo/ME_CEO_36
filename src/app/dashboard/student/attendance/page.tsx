'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentAttendancePage() {
  return (
    <>
      <PageHeader
        title="My Attendance"
        description="View your attendance record."
      />
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Your attendance details will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
