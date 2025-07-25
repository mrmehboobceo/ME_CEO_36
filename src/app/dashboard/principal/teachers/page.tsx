'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getTeachers, deleteTeacher as deleteTeacherFromDB, addTeacher as addTeacherToDB } from '@/lib/data';
import type { Teacher } from '@/types';
import { PageHeader } from '@/components/dashboard/shared/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addTeacherSchema } from '@/lib/schemas';
import type { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export default function TeachersPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const form = useForm<z.infer<typeof addTeacherSchema>>({
    resolver: zodResolver(addTeacherSchema),
  });

  const fetchTeachers = () => {
    if (currentUser) {
      setTeachers(getTeachers(currentUser.schoolCode));
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentUser]);

  const handleAddOrUpdateTeacher = (values: z.infer<typeof addTeacherSchema>) => {
    if (!currentUser) return;
    
    const teacherData = { ...values, email: editingTeacher ? editingTeacher.id : values.email };

    const success = addTeacherToDB(currentUser.schoolCode, teacherData, editingTeacher?.id);

    if (success) {
      toast({
        title: editingTeacher ? 'Teacher Updated' : 'Teacher Added',
        description: `${values.name} has been successfully ${editingTeacher ? 'updated' : 'added'}.`,
      });
      fetchTeachers();
      setIsSheetOpen(false);
      setEditingTeacher(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${editingTeacher ? 'update' : 'add'} teacher. A teacher with this ID may already exist.`,
      });
    }
  };

  const deleteTeacher = (teacherId: string) => {
    if (!currentUser) return;
    const success = deleteTeacherFromDB(currentUser.schoolCode, teacherId);
    if (success) {
      toast({
        title: 'Teacher Deleted',
        description: 'The teacher has been removed from the system.',
      });
      fetchTeachers();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete teacher.',
      });
    }
  };
  
  const openEditSheet = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset({
        name: teacher.name,
        email: teacher.id,
        password: teacher.password || '******', // Don't expose password
        assignedClass: teacher.assignedClass || '',
    });
    setIsSheetOpen(true);
  };

  const openAddSheet = () => {
    setEditingTeacher(null);
    form.reset({
        name: '',
        email: '',
        password: '',
        assignedClass: '',
    });
    setIsSheetOpen(true);
  }

  return (
    <>
      <PageHeader title="Manage Teachers" description="Add, edit, or remove teacher profiles.">
        <Button onClick={openAddSheet}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </PageHeader>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Assigned Class</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-mono">{teacher.id}</TableCell>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.assignedClass || 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditSheet(teacher)}>
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
                              This action cannot be undone. This will permanently delete the teacher's record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTeacher(teacher.id)}>Delete</AlertDialogAction>
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
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</SheetTitle>
            <SheetDescription>
             {editingTeacher ? 'Update the details for this teacher.' : 'Fill in the form to add a new teacher.'}
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddOrUpdateTeacher)} className="space-y-4 py-4">
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher ID / Email</FormLabel>
                    <FormControl><Input placeholder="teacher@example.com" {...field} disabled={!!editingTeacher} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="assignedClass"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Class (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., 10-A" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit">{editingTeacher ? 'Save Changes' : 'Add Teacher'}</Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
