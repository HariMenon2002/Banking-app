import HeaderBox from '@/components/HeaderBox'
import TotalBalanceBox from '@/components/TotalBalanceBox';
import React from 'react'

const Home = () => {
  
  const loggedIn={firstName:'Hari'};
  return (
    <section className='home'> 
        <div className='home-content'>
            <header className='home-header'>
                <HeaderBox
                    type="greeting"
                    title="Welcome"
                    user={loggedIn?.firstName||'Guest'}
                    subtext="Access and manage your account and transactions efficiently"
                />

                <TotalBalanceBox 
                    accounts={[]}  //the accounts that user has
                    totalBanks={1}
                    totalCurrentBalance={1250.35}
                />
            </header>
        </div>
    </section> 
    //home will be available in global.css
  )
}

export default Home
