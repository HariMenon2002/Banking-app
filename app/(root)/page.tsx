import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions';
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Home = async ({searchParams:{id,page}}:SearchParamProps) => {
  const currentPage=Number(page as string)||1;
  const loggedIn=await getLoggedInUser();
                //   console.log("log in id is",loggedIn.$id);
                //   console.log("log in id is",loggedIn.firstName);
  const accounts=await getAccounts({userId:loggedIn.$id})
                //console.log("okay");
  if(!accounts) {console.log("page.tsx accounts error");return;}
  
  const accountsData=accounts?.data;
  const appwriteItemId=(id as string) || accounts?.data[0]?.appwriteItemId;
                                //console.log("okay2");
  console.log(accountsData);
                            //console.log(accounts?.data?.slice(0,2));
  //const account= await getAccount({appwriteItemId});
//   console.log({
//     accountsData,
//     account
//   });
 
  return (
    <section className='home'> 
        <div className='home-content'>
            <header className='home-header'>
                <HeaderBox
                    type="greeting"
                    title="Welcome"
                    //user={loggedIn?.name||'Guest'}
                    user={loggedIn?.firstName||'Guest'}
                    subtext="Access and manage your account and transactions efficiently"
                />

                <TotalBalanceBox 
                    accounts={accounts?.data}  //the accounts that user has
                    totalBanks={accounts?.totalBanks}
                    totalCurrentBalance={accounts?.totalCurrentBalance}
                />
            </header>

            <RecentTransactions accounts={accountsData} transactions={accounts?.transactions} appwriteItemId={appwriteItemId} page={currentPage}/>
        </div>
        
        <RightSidebar user={loggedIn} transactions={accounts?.transactions} banks={accounts?.data?.slice(0,2)}></RightSidebar>
    </section> 
    //home will be available in global.css
  )
}

export default Home
