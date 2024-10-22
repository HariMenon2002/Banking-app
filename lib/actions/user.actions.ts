'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn=async({email,password}:signInProps)=>{
    try{    
        const { account } = await createAdminClient();
        const response=await account.createEmailPasswordSession(email,password);

        return parseStringify(response);
    }catch(error){  
        console.log("Error",error)
    }
}

export const signUp=async(userData:SignUpParams)=>{
    try{
        const { account } = await createAdminClient();

        //const newUserAccount=await account.create(ID.unique(), email, password, name);
        const newUserAccount=await account.create(ID.unique(), userData.email, userData.password,`${userData.firstName}${userData.lastName}`);
        const session = await account.createEmailPasswordSession(userData.email, userData.password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUserAccount);
    }catch(error){
        console.log("Error",error)
    }
}

// ... your initilization functions using appwrite

export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      //return await account.get();  //you cant do this as you cant directly send objects from server actions to frontend
      const user=await account.get();
      return parseStringify(user);
    } catch (error) {
      return null;
    }
}
  