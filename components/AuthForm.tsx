'use client';
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"



import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"  //do npx shadcn-ui@latest add input
import CustomInputForm from './CustomInputForm';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signIn, signUp } from '@/lib/actions/user.actions';

// const authFormSchema = z.object({
//     email: z.string().email(),
// });

const AuthForm = ({type}:{type:string}) => {
  const router=useRouter();
  const [user,setUser]=useState(null);
  const [isLoading,setIsLoading]=useState(false);

  const formSchema=authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password:""
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit=async function(data: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true);
    try{
        //sign up with Appwrite and create a plaid token
        if(type=='sign-up'){
            const newUser=await signUp(data);
            setUser(newUser);
        }
        if(type=='sign-in'){
            const response=await signIn({
                email:data.email,
                password:data.password,
            })

            if(response){
                   router.push('/')     //going to home pagee
            }
        }
    }catch(error){
        console.log(error);
    }finally{
        setIsLoading(false);
    }
    setIsLoading(false);
  }

  return (
    <section className='auth-form'>
      <header className='flex flex-col gap-5 md:gap-8'>
        <Link href='/' className='flex cursor-pointer items-center gap-1'>
                <Image src='/icons/logo.svg' width={34} height={34} alt='Harizon logo' className='size-[24px] max-xl:size-14'></Image>

                <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>Harizon</h1>
                
        </Link>

        <div className='flex flex-col gap-1 md:gap-3'>
            <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                {user?'Link account':type==='sign-in'?'Sign In':'Sign Up'}

                <p className='text-16 font-normal text-gray-600'>
                    {user?'Link your account to get started':'Please enter your details'}
                </p>
            </h1>
        </div>
      </header>
      {user?(
        <div className='flex flex-col gap-4'>
            {/*Plaid link */}
        </div>
      ):(
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    
                    {type=='sign-up' && (
                        <>
                            <div className='flex gap-4'>
                                <CustomInputForm control={form.control} name='firstName' label="First Name" placeholder='Enter your first name'/>
                                <CustomInputForm control={form.control} name='lastName' label="Last Name" placeholder='Enter your last name'/>
                            </div>

                            <CustomInputForm control={form.control} name='address1' label="Address" placeholder='Enter your specific address'/>
                            <CustomInputForm control={form.control} name='city' label="City" placeholder='Enter your city'/>

                            <div className='flex gap-4'>
                                <CustomInputForm control={form.control} name='state' label="State" placeholder='Example: NY'/>
                                <CustomInputForm control={form.control} name='postalCode' label="Postal Code" placeholder='Example: 6800'/>
                            </div>


                            <div className='flex gap-4'>
                                <CustomInputForm control={form.control} name='dateofBirth' label="Date of Birth" placeholder='YYYY-MM-DD'/>
                                <CustomInputForm control={form.control} name='ssn' label="SSN" placeholder='Example: 1234'/>
                            </div>
                        </>
                    )}



                    <CustomInputForm control={form.control} name="email" label="Email" placeholder='Email'/>
                    <CustomInputForm control={form.control} name="password" label="Password" placeholder='Password'/>
                    <div className='flex flex-col gap-4'>
                        <Button disabled={isLoading} type="submit" className='form-btn'>
                            {isLoading?(<>
                                    <Loader2 size={20} className='animate-spin'/>&nbsp;
                                    Loading...
                    
                                </>
                            ):type=='sign-in'?'Signin':'Signout'}
                        </Button>
                    </div>
                </form>
            </Form>

            <footer className='flex justify-center gap-1'>
                <p className='text-14 font-normal text-gray-600'>{type=='sign-in'?"Dont have an account?":"Already have an account"}</p>
                <Link href={type=='sign-in'?'/sign-up':'/sign-in'} className='form-link'>{type=='sign-in'?'Sign Up':'Sign In'}</Link>
            </footer>
        </>
      )}
    </section>
  )
}

export default AuthForm
