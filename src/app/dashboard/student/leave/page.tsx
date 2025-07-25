'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentLeavePage() {
  return (
    <>
      <PageHeader
        title="Apply for Leave"
        description="Submit a leave request for absence."
      />
      <Card>
        <CardHeader>
          <CardTitle>New Leave Application</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. You will be able to apply for leave from this page.</p>
        </CardContent>
      </Card>
    </>
  );
}
