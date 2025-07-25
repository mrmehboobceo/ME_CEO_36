'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrincipalLeavesPage() {
  return (
    <>
      <PageHeader
        title="Leave Requests"
        description="Review and approve or reject leave requests from students and staff."
      />
      <Card>
        <CardHeader>
          <CardTitle>Leave Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Leave request management features will be available here soon.</p>
        </CardContent>
      </Card>
    </>
  );
}
