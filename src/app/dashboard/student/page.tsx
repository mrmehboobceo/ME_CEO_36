'use client';

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboardPage() {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    return (
        <>
            <PageHeader
                title={`Hi, ${currentUser.name}!`}
                description="Your personal dashboard for everything school-related."
            />
            <Card>
                <CardHeader>
                    <CardTitle>Student Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Welcome to your portal. Here you can check your attendance, fees, and apply for leave.</p>
                </CardContent>
            </Card>
        </>
    );
}
