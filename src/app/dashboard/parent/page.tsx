'use client';

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentDashboardPage() {
    const { currentUser } = useAuth();
    if (!currentUser) return null;

    return (
        <>
            <PageHeader
                title={`Welcome, ${currentUser.name}!`}
                description="Keep track of your child's school activities."
            />
            <Card>
                <CardHeader>
                    <CardTitle>Parent Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This is your portal to view your child's attendance, fee status, and receive important notifications from the school.</p>
                </CardContent>
            </Card>
        </>
    );
}
