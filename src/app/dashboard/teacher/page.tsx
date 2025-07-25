'use client';

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboardPage() {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    return (
        <>
            <PageHeader
                title={`Welcome, ${currentUser.name}!`}
                description="Manage your class and daily tasks here."
            />
            <Card>
                <CardHeader>
                    <CardTitle>Teacher Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is the main dashboard for teachers. Features like attendance marking and viewing assigned classes will be available here.</p>
                </CardContent>
            </Card>
        </>
    );
}
