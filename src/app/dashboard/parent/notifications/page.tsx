'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="Receive important announcements and alerts regarding your child."
      />
      <Card>
        <CardHeader>
          <CardTitle>School Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. All notifications from the school will appear here.</p>
        </CardContent>
      </Card>
    </>
  );
}
