//copy the root layout first

/*the thing is that some pages need a sidebar , that is why we created a seperate folder with pages for sidebar */


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        SIDEBAR
        {children}
    </main>
  );
}
