'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { useAuth } from "@/hooks/useAuth";
import { getStudents, getTeachers, getDailyAttendancePercentage } from "@/lib/data";
import { Users, UserCheck, Percent, Bell, ArrowRight, UserPlus, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PrincipalDashboardPage() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    attendance: 0,
    alerts: 0,
  });

  useEffect(() => {
    if (currentUser) {
        const students = getStudents(currentUser.schoolCode);
        const teachers = getTeachers(currentUser.schoolCode);
        const attendance = getDailyAttendancePercentage(currentUser.schoolCode);
        
        setStats({
            students: students.length,
            teachers: teachers.length,
            attendance: attendance,
            alerts: 5, // Mock data
        });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <>
      <PageHeader
        title={`Welcome, ${currentUser.name}!`}
        description="Here's a summary of your school's activities."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
            <p className="text-xs text-muted-foreground">
              in your school
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
             <p className="text-xs text-muted-foreground">
              employed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Attendance</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance}%</div>
            <p className="text-xs text-muted-foreground">
              of students present today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.alerts}</div>
             <p className="text-xs text-muted-foreground">
              notifications to review
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
               <Link href="/dashboard/principal/students" passHref>
                  <Button variant="outline" className="w-full justify-start h-12">
                     <Users className="mr-2" />
                     Manage Students
                     <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
               </Link>
               <Link href="/dashboard/principal/teachers" passHref>
                  <Button variant="outline" className="w-full justify-start h-12">
                     <UserCheck className="mr-2" />
                     Manage Teachers
                     <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
               </Link>
               <Link href="/dashboard/principal/notifications" passHref>
                  <Button variant="outline" className="w-full justify-start h-12">
                     <Bell className="mr-2" />
                     Send Notifications
                     <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
               </Link>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
