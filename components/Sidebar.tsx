'use client'

import { sidebarLinks } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const Sidebar = ({user}:SiderbarProps) => {

  const pathname=usePathname();
  return (
    <section className='sidebar'>
        <nav className='flex flex-col gap-4k'>
            <Link href='/' className='mb-12 cursor-pointer items-center gap-2'>
                <Image src='/icons/logo.svg' width={34} height={34} alt='Harizon logo' className='size-[24px] max-xl:size-14'></Image>

                <h1 className='sidebar-logo'>Harizon</h1>
            </Link>

            {sidebarLinks.map((item)=>{   //look at components for this
                    const isActive= pathname===item.route||pathname.startsWith(`${item.route}/`)
                return (
                    <Link href={item.route} key={item.label} className={cn('sidebar-link',{'bg-bank-gradient':isActive})}>
                        <div className='relative size-6'>
                            <Image src={item.imgURL} alt={item.label} fill></Image>
                        </div>
                    </Link>
                )
            })}
        </nav>
    </section>
  )
}

export default Sidebar
