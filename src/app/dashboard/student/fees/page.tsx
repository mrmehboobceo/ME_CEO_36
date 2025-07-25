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

export default function StudentFeesPage() {
  const { currentUser } = useAuth();
  const [fees, setFees] = useState<FeePayment[]>([]);

  useEffect(() => {
    if (currentUser) {
      const feeRecords = getFeesForStudent(currentUser.schoolCode, currentUser.id);
      setFees(feeRecords);
    }
  }, [currentUser]);

  return (
    <>
      <PageHeader
        title="My Fees"
        description="Check your fee status and payment history."
      />
      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
          <CardDescription>A record of your fee payments and outstanding dues.</CardDescription>
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
              <p className="text-muted-foreground">No fee records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
