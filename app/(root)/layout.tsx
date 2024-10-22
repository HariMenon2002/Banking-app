//copy the root layout first

import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import Image from "next/image";


/*the thing is that some pages need a sidebar , that is why we created a seperate folder with pages for sidebar */


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const  loggedIn=await getLoggedInUser();

  if(!loggedIn) {console.log("wont work1");redirect('/sign-in');}
  else console.log("works");
  return (
    <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn}/>

        <div className="flex size-full flex-col">
            <div className="root-layout">
                <Image src="/icons/logo.svg" width={30} height={30} alt="logo"></Image>
                <div>
                  <MobileNav user={loggedIn}/>
                </div>
            </div>
            {children}
        </div>
    </main>
  );
}
