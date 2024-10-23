'use server';

import { ID,Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";




export const signIn=async({email,password}:signInProps)=>{
    try{    
        const { account } = await createAdminClient();
        const response=await account.createEmailPasswordSession(email,password);


        cookies().set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
          });
        
        return parseStringify(response);


    }catch(error){  
        console.log("Error",error)
    }
}

export const signUp=async(userData:SignUpParams)=>{
    try{
        const { account } = await createAdminClient();

        //const newUserAccount=await account.create(ID.unique(), email, password, name);
        const newUserAccount=await account.create(ID.unique(), userData.email, userData.password,`${userData.firstName} ${userData.lastName}`);
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
      console.log("betweeeeeeeeeen");
      const user=await account.get();
      return parseStringify(user);
    } catch (error) {
      return null;
    }
}

export const logoutAccount=async()=>{
    try{
        const {account}=await createSessionClient();
        cookies().delete('appwrite-session');
        await account.deleteSession('current');
    }catch(error){
        return null;
    }
}

export const createLinkToken=async(user:User)=>{
    try{
        const tokenParams={
            user:{
                client_user_id:user.$id
            },
            client_name:user.name,
            products:['auth'] as Products[],
            language:'en',
            country_codes:['US'] as CountryCode[],
        };

        const response=await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({linkToken:response.data.link_token});
    }catch(error){
        console.log(error);
    }
}

export const exchangePublicToken=async({publicToken,user}:exchangePublicTokenProps)=>{
    try{    
        //exchange public token for access token
        const response=await plaidClient.itemPublicTokenExchange({public_token:publicToken});
        const accessToken= response.data.access_token; 
        const itemId=response.data.item_id;

        //get account info form Plaid using access token
        const accountResponse=await plaidClient.accountsGet({
            access_token:accessToken,
        });

        const accountData=accountResponse.data.accounts[0];

        //now we can create processor token for dwolla

        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };
      
        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;
    
        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        //this is to connect payment processing functionality with the bank account
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });
          
          // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;
          // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            shareableId: encryptId(accountData.account_id),
        });
  
      // Revalidate the path to reflect the changes
        revalidatePath("/");
    
        // Return a success message
        return parseStringify({
            publicTokenExchange: "complete",
        });





    }catch(error){
        console.log("An error occured while creating exchanging token ",error);
    }
}