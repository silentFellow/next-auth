'use client'

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { userValidation } from "@/lib/validation/users.validation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "next-auth/react";

const LoginForm = () => {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userValidation),
    defaultValues: {
      username: "",
      password: ""
    }
  })

  const onSubmit = async (value: z.infer<typeof userValidation>) => {
    try {
      const res = await signIn('credentials', {
        username: value.username,
        password: value.password,
        redirect: false
      });
      if(res?.ok) router.push("/");
    } catch(error: any) {
      console.log(`Error: ${error.message}`)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 w-full">
              <FormLabel className="text-[16px] leading-[140%] font-[600px] text-light-2">Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your username..."
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 w-full">
              <FormLabel className="text-base-semibold text-light-2">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your username..."
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-black">Login</Button>
      </form>
    </Form>
  )
}

export default LoginForm;
