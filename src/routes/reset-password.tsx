import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/app/AuthForm';
import { pageHead } from '@/lib/meta';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset password','Securely reset your StudyOS account password.'),component:()=> <AuthForm recovery/>});
