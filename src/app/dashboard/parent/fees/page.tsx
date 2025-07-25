'use client';
import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { getFeesForStudent } from '@/lib/data';
import type { FeePayment } from '@/types';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';

export default function ParentFeesPage() {
  const { currentUser } = useAuth();
  const [fees, setFees] = useState<FeePayment[]>([]);

  useEffect(() => {
    if (currentUser?.role === 'Parent' && currentUser.childIds.length > 0) {
      // For simplicity, showing fees for the first child
      const childId = currentUser.childIds[0];
      const feeRecords = getFeesForStudent(currentUser.schoolCode, childId);
      setFees(feeRecords);
    }
  }, [currentUser]);

  return (
    <>
      <PageHeader
        title="Child's Fees"
        description="View your child's fee status and payment history."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee History</CardTitle>
           <CardDescription>
            Showing fee records for {currentUser?.childIds[0] ? `student ID ${currentUser.childIds[0]}` : 'your child'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {fees.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Paid On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.map((fee, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">Rs. {fee.amount.toLocaleString()}</TableCell>
                      <TableCell>{fee.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={fee.status === 'Paid' ? 'default' : 'secondary'}>
                           {fee.status === 'Paid' ? 
                           <CheckCircle className="mr-2 h-4 w-4" /> : 
                           <Clock className="mr-2 h-4 w-4" />}
                          {fee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{fee.paidOn || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
           ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No fee records found for your child.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
