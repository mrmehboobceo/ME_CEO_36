'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/lib/schemas';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      schoolName: '',
      schoolCategory: 'Private',
      principalName: '',
      principalEmail: '',
      password: '',
      schoolCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    const success = await register(values);
    if (success) {
      toast({
        title: 'Registration Successful!',
        description: 'Your school and principal account have been created. Please log in.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: 'A school with this code may already exist. Please try again.',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Your School</CardTitle>
        <CardDescription>Setup your school and create the main administrator account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Greenwood High" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Government">Government</SelectItem>
                        <SelectItem value="PEF">PEF</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                        <SelectItem value="Academy">Academy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="principalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal's Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="principalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Principal's Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="principal@example.com" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="schoolCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School Code</FormLabel>
                    <FormControl>
                      <Input placeholder="A unique code for your school" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-start text-sm">
        <p>Already have an account?</p>
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login here
        </Link>
      </CardFooter>
    </Card>
  );
}
