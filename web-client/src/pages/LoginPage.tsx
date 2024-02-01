import {Input} from '@/components/ui/input.tsx';
import {Button} from '@/components/ui/button.tsx';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {request} from '@/api/axios.ts';
import {CookieService} from '@/services/CookieService.ts';
import {useNavigate} from 'react-router-dom';
import {LoginFormInfer, LoginFormSchema} from '@/schemas/loginForm.ts';
import {NotificationService} from '@/services/NotificationService.ts';
import {useSetAtom} from 'jotai';
import {userDataAtom} from '@/store/users.ts';
import {LoginResponse} from '@/types/user.types.ts';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUserData = useSetAtom(userDataAtom);

  const form = useForm<LoginFormInfer>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormInfer) {
    try {
      const res = await request.post<LoginResponse>('/auth/login', data);
      const token = res?.data?.token;
      setUserData(res?.data.user);
      new CookieService().setToken(token);
      navigate('/');
      NotificationService.success('Login successful');
    } catch (e: unknown) {
      if (e instanceof Error) {
        NotificationService.error(e.message);
      }
    }
  }

  return (
    <section className="w-screen h-screen flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-72 w-2/3 space-y-2">
          <FormField
            control={form.control}
            name="login"
            render={({field}) => (
              <FormItem>
                <FormLabel>Login</FormLabel>
                <FormControl>
                  <Input placeholder="your_nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({field}) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="your_password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </section>
  );
}
