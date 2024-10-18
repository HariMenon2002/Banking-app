//copy the root layout first

import Sidebar from "@/components/Sidebar";

/*the thing is that some pages need a sidebar , that is why we created a seperate folder with pages for sidebar */


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const  loggedIn={firstName:'Hari',lastName:'Menon'};
  return (
    <main className="flex h-screen w-full font-inter">
        <Sidebar user={loggedIn}/>
        {children}
    </main>
  );
}
