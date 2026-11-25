import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/app/AuthForm';
import { pageHead } from '@/lib/meta';
export const Route=createFileRoute('/auth')({head:()=>pageHead('Sign in','Sign in or create your private StudyOS account.'),component:AuthForm});
