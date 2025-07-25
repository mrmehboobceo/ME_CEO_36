'use client';
import { useEffect, useState } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { getStudentById } from '@/lib/data';
import type { Student } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, CircleUserRound, BadgeCheck, School } from 'lucide-react';

export default function ParentDashboardPage() {
    const { currentUser } = useAuth();
    const [children, setChildren] = useState<Student[]>([]);

    useEffect(() => {
        if (currentUser && currentUser.role === 'Parent' && currentUser.childIds) {
            const childData = currentUser.childIds
                .map(id => getStudentById(currentUser.schoolCode, id))
                .filter((child): child is Student => child !== null);
            setChildren(childData);
        }
    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <>
            <PageHeader
                title={`Welcome, ${currentUser.name}!`}
                description="Keep track of your child's school activities."
            />

            {children.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {children.map(child => (
                        <Card key={child.id}>
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-16 w-16 border">
                                    <AvatarImage src={child.photoUrl} alt={child.name} />
                                    <AvatarFallback>
                                        <User className="h-8 w-8" />
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{child.name}</CardTitle>
                                    <CardDescription>Student ID: {child.id}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <School className="h-4 w-4 text-muted-foreground" />
                                    <span>Class: <strong>{child.class}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CircleUserRound className="h-4 w-4 text-muted-foreground" />
                                    <span>Father: <strong>{child.fatherName}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>DOB: <strong>{child.dob}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BadgeCheck className={`h-4 w-4 ${child.nadraVerified ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <span>NADRA Verified: <strong>{child.nadraVerified ? 'Yes' : 'No'}</strong></span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle>No Children Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No student profiles are linked to your parent account. Please contact the school administration to link your children.</p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Parent Portal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Use the navigation on the left to view your child's attendance, fee status, and receive important notifications from the school.</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
