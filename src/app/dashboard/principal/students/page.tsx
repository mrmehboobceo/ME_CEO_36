'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStudents, deleteStudent as deleteStudentFromDB, addStudent as addStudentToDB } from '@/lib/data';
import type { Student } from '@/types';
import { PageHeader } from '@/components/dashboard/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, User as UserIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addStudentSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function StudentsPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const form = useForm<z.infer<typeof addStudentSchema>>({
    resolver: zodResolver(addStudentSchema),
  });

  const fetchStudents = () => {
    if (currentUser) {
      setStudents(getStudents(currentUser.schoolCode));
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentUser]);

  const handleAddOrUpdateStudent = (values: z.infer<typeof addStudentSchema>) => {
    if (!currentUser) return;
    
    const studentData: Omit<Student, 'id' | 'role' | 'schoolCode'> = {
        ...values,
        photoUrl: editingStudent?.photoUrl // keep existing photo for now
    };

    const success = addStudentToDB(currentUser.schoolCode, studentData, editingStudent?.id);

    if (success) {
      toast({
        title: editingStudent ? 'Student Updated' : 'Student Added',
        description: `${values.name} has been successfully ${editingStudent ? 'updated' : 'added'}.`,
      });
      fetchStudents();
      setIsSheetOpen(false);
      setEditingStudent(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingStudent ? 'update' : 'add'} student.`,
      });
    }
  };

  const deleteStudent = (studentId: string) => {
    if (!currentUser) return;
    const success = deleteStudentFromDB(currentUser.schoolCode, studentId);
    if (success) {
      toast({
        title: 'Student Deleted',
        description: 'The student has been removed from the system.',
      });
      fetchStudents();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete student.',
      });
    }
  };

  const openEditSheet = (student: Student) => {
    setEditingStudent(student);
    form.reset({
        ...student,
        dob: student.dob,
    });
    setIsSheetOpen(true);
  };

  const openAddSheet = () => {
    setEditingStudent(null);
    form.reset({
        name: '',
        class: '',
        dob: '',
        fatherName: '',
        bFormNo: '',
        fatherCnic: '',
        nadraVerified: false,
        parentId: '',
    });
    setIsSheetOpen(true);
  }

  return (
    <>
      <PageHeader title="Manage Students" description="Add, edit, or remove student profiles.">
        <Button onClick={openAddSheet}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Parent ID</TableHead>
                  <TableHead>NADRA Verified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={student.photoUrl} />
                        <AvatarFallback><UserIcon /></AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.parentId}</TableCell>
                    <TableCell>
                      <Badge variant={student.nadraVerified ? 'default' : 'secondary'}>
                        {student.nadraVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditSheet(student)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the student's record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteStudent(student.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</SheetTitle>
            <SheetDescription>
              {editingStudent ? 'Update the details for this student.' : 'Fill in the form to add a new student.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddOrUpdateStudent)} className="space-y-4 py-4">
              {/* Form fields from addStudentSchema */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Class</FormLabel>
                        <FormControl><Input placeholder="10-A" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father's Name</FormLabel>
                    <FormControl><Input placeholder="Richard Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="bFormNo"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>B-Form No.</FormLabel>
                        <FormControl><Input placeholder="123456789" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fatherCnic"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Father's CNIC</FormLabel>
                        <FormControl><Input placeholder="35202-1234567-1" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>
               <FormField
                    control={form.control}
                    name="parentId"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent ID</FormLabel>
                        <FormControl><Input placeholder="P001" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              <FormField
                control={form.control}
                name="nadraVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>NADRA Verified</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
