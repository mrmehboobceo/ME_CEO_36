'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherLeavesPage() {
  return (
    <>
      <PageHeader
        title="Student Leave Requests"
        description="View leave requests from students in your class."
      />
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Teachers will be able to view student leave requests here.</p>
        </CardContent>
      </Card>
    </>
  );
}
