import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Transfer = async () => {
  const loggedIn=await getLoggedInUser();
                //   console.log("log in id is",loggedIn.$id);
                //   console.log("log in id is",loggedIn.firstName);
  const accounts=await getAccounts({userId:loggedIn.$id})
                //console.log("okay");
  if(!accounts) {console.log("page.tsx accounts error");return;}
  
  const accountsData=accounts?.data;
  return (
    <section className='payment-transfer'>
      <HeaderBox title='Payment Transfer ' subtext='Please provide any specific details or notes related to payment transfer'/>
      <section className='size-full pt-5'>
        <PaymentTransferForm accounts={accountsData}/>
      </section>
    </section>
  )
}

export default Transfer
