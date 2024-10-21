'use client'
import React from 'react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"

import { Input } from "@/components/ui/input";
import { Control, FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { authFormSchema } from '@/lib/utils';

//make authFormSchema in utils
const formSchema=authFormSchema('sign-up');
interface CustomInput{
    control:Control<z.infer<typeof formSchema>>,
    //name:'email'|'password'
    name:FieldPath<z.infer<typeof formSchema>> , //does same as above
    label:string,
    placeholder:string
}

const CustomInputForm = ({control,name,label,placeholder}:CustomInput) => {
  return (
    
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className='form-item'>
                    <FormLabel className='form-label'>
                        {label}
                    </FormLabel>
                    <div className='flex w-full flex-col '>
                        <FormControl>
                            <Input placeholder={placeholder} className='input-class' type={name=='password'?'password':'text'} {...field}/>
                        </FormControl>

                        <FormMessage className='form-message mt-2'/>
                        {/*form message is if there is any error */}
                        {/*{...field} in form control is very important */}
                        
                    </div>
                </div>
            )}
        />
    
  )
}

export default CustomInputForm
