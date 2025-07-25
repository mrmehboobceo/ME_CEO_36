'use client';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentNotificationsPage() {
  return (
    <>
      <PageHeader
        title="Notifications"
        description="View important announcements and alerts from the school."
      />
      <Card>
        <CardHeader>
          <CardTitle>My Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This page is under construction. All your notifications will appear here.</p>
        </CardContent>
      </Card>
    </>
  );
}
