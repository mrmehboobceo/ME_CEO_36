'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrincipalFeesPage() {
  return (
    <>
      <PageHeader
        title="Fee Management"
        description="Manage fee structures, track payments, and send reminders."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. School-wide fee management tools will be available here soon.</p>
        </CardContent>
      </Card>
    </>
  );
}
