import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/app/AuthForm';
import { pageHead } from '@/lib/meta';
export const Route=createFileRoute('/')({head:()=>pageHead('Welcome','Sign in to StudyOS, your private study workspace across devices.'),component:AuthForm});
