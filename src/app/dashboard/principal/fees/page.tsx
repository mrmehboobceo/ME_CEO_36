'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFeePayments, updateFeePaymentStatus, getStudents } from '@/lib/data';
import type { FeePayment, Student } from '@/types';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

type FeeWithStudentInfo = FeePayment & { studentName: string; studentClass: string };

export default function PrincipalFeesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [feeRecords, setFeeRecords] = useState<FeeWithStudentInfo[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeWithStudentInfo | null>(null);

  const fetchFeeRecords = () => {
    if (currentUser) {
      const allFees = getFeePayments(currentUser.schoolCode);
      const allStudents = getStudents(currentUser.schoolCode);
      const studentMap = new Map(allStudents.map(s => [s.id, { name: s.name, class: s.class }]));
      
      const enrichedFees = allFees.map(fee => ({
        ...fee,
        studentName: studentMap.get(fee.studentId)?.name || 'Unknown',
        studentClass: studentMap.get(fee.studentId)?.class || 'N/A',
      }));
      setFeeRecords(enrichedFees);
    }
  };

  useEffect(() => {
    fetchFeeRecords();
  }, [currentUser]);

  const handleUpdateStatus = (fee: FeeWithStudentInfo) => {
    if (!currentUser) return;
    const newStatus = fee.status === 'Paid' ? 'Unpaid' : 'Paid';
    const paidOn = newStatus === 'Paid' ? format(new Date(), 'yyyy-MM-dd') : undefined;

    const success = updateFeePaymentStatus(currentUser.schoolCode, fee.studentId, fee.dueDate, newStatus, paidOn);

    if (success) {
      toast({
        title: 'Status Updated',
        description: `Fee status for ${fee.studentName} has been updated to ${newStatus}.`
      });
      fetchFeeRecords();
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the fee status.'
      });
    }
  };


  return (
    <>
      <PageHeader
        title="Fee Management"
        description="Track payments and manage fee statuses for all students."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee Dashboard</CardTitle>
          <CardDescription>View all student fee records in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeRecords.length > 0 ? feeRecords.map((fee) => (
                  <TableRow key={`${fee.studentId}-${fee.dueDate}`}>
                    <TableCell className="font-medium">{fee.studentName}</TableCell>
                    <TableCell>{fee.studentClass}</TableCell>
                    <TableCell>Rs. {fee.amount.toLocaleString()}</TableCell>
                    <TableCell>{fee.dueDate}</TableCell>
                    <TableCell>
                      <Badge variant={fee.status === 'Paid' ? 'default' : 'secondary'}>
                        {fee.status === 'Paid' ? <Check className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                        {fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{fee.paidOn || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to mark this fee as 
                                <span className={`font-bold ${fee.status === 'Paid' ? 'text-destructive' : 'text-primary'}`}>
                                  {fee.status === 'Paid' ? ' Unpaid' : ' Paid'}
                                </span>
                                 ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUpdateStatus(fee)}>
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">No fee records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
