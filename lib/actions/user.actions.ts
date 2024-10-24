'use server';

import { ID,Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

//for us to make accessing env variables easier we do
const {APPWRITE_DATABASE_ID: DATABASE_ID,   //this is basically renaming
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,}=process.env;

export const getUserInfo=async({userId}:getUserInfoProps)=>{
    try{
        const {database}=await createAdminClient();
        const user=await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId',[userId])]
        );
        
        return parseStringify(user.documents[0]);
    }catch(error){
        console.log(error);
    }
}
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
        
        const user=await getUserInfo({userId:response.userId});
        return parseStringify(user);


    }catch(error){  
        console.log("Error",error)
    }
}

export const signUp=async({password,...userData}:SignUpParams)=>{  //basically i have extracted password out of userData as i dont want to send it with dwolla

    let newUserAccount;
    try{
        const { account,database } = await createAdminClient();

        //const newUserAccount=await account.create(ID.unique(), email, password, name);
        newUserAccount=await account.create(ID.unique(), userData.email, password,`${userData.firstName} ${userData.lastName}`);
        if(!newUserAccount) throw new Error('Error creating user')
        
        const dwollaCustomerUrl=await createDwollaCustomer({
            ...userData,
            type:'personal'
        });

        if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer')
        const dwollaCustomerId=extractCustomerIdFromUrl(dwollaCustomerUrl);
        const newUser=await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId:newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )

        const session = await account.createEmailPasswordSession(userData.email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        //return parseStringify(newUserAccount);    old one
        return parseStringify(newUser);    //comes directly from database
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
      const result=await account.get();  //this is user from a session
      
      const user=await getUserInfo({userId:result.$id})
      
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
            //client_name:user.name,
            client_name:`${user.firstName} ${user.lastName}`, //database doesnt have name, it just has firstName and lastName
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

export const createBankAccount=async({userId,bankId,accountId,accessToken,fundingSourceUrl,shareableId}:createBankAccountProps)=>{
    try{
        //we will create bankaccount as document in database(appwrite)
        const {database}=await createAdminClient(); //appwrite client which allows us to create new documents
        const bankAccount=await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,bankId,accountId,accessToken,fundingSourceUrl,shareableId
            }
        )

        return parseStringify(bankAccount);
    }catch(error){

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
        const fundingSourceUrl = await addFundingSource({  //from dwolla
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

export const getBanks=async({userId}:getBanksProps)=>{
    try{
        const {database}=await createAdminClient();
        const banks=await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId',[userId])]
        );

        return parseStringify(banks.documents);
    }catch(error){
        console.log(error);
    }
}

export const getBank=async({documentId}:getBankProps)=>{
    try{
        const {database}=await createAdminClient();
        const bank=await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id',[documentId])]
        );

        return parseStringify(bank.documents);
    }catch(error){
        console.log(error);
    }
}