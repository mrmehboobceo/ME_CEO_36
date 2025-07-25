'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentAttendancePage() {
  return (
    <>
      <PageHeader
        title="Child's Attendance"
        description="Monitor your child's attendance record."
      />
      <Card>
        <CardHeader>
          <CardTitle>Attendance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Your child's attendance records will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
