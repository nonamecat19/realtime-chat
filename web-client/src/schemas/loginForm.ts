import {z} from 'zod';

export const LoginFormSchema = z.object({
  login: z
    .string()
    .min(3, {
      message: 'Username must be at least 3 characters.',
    })
    .max(20, {
      message: 'Nickname max length is 20',
    }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

export type LoginFormInfer = z.infer<typeof LoginFormSchema>;
