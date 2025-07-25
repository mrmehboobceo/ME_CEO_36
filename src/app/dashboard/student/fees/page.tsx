'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentFeesPage() {
  return (
    <>
      <PageHeader
        title="My Fees"
        description="Check your fee status and payment history."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Your fee payment information will be available here.</p>
        </CardContent>
      </Card>
    </>
  );
}
