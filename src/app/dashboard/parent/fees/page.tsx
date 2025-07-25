'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentFeesPage() {
  return (
    <>
      <PageHeader
        title="Child's Fees"
        description="View your child's fee status and payment history."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. Your child's fee information will be displayed here.</p>
        </CardContent>
      </Card>
    </>
  );
}
