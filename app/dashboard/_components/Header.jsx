'use client'

import React, { useCallback } from 'react'
import Image from 'next/image'
import { UserButton } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

function Header() {
    const path = usePathname();
    const router = useRouter();

    const handleNavigation = useCallback((href) => {
        router.push(href);
    }, [router]);

  return (
        <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
        <Link href='/dashboard' className='hover:opacity-80 transition-opacity'>
            <Image src={'/logo.svg'} width={160} height={100} alt='logo'/>
        </Link>
        <ul className='hidden md:flex gap-6'>

           <li 
            onClick={() => handleNavigation('/dashboard')}
            className={`hover:text-blue-600 hover:font-bold transition-all
            cursor-pointer py-2 px-3 rounded
            ${path=='/dashboard'?'text-primary font-bold bg-blue-100':'text-gray-700'}`}
            >Dashboard</li>

           <li 
            onClick={() => handleNavigation('/dashboard/questions')}
            className={`hover:text-blue-600 hover:font-bold transition-all
            cursor-pointer py-2 px-3 rounded
            ${path=='/dashboard/questions'?'text-primary font-bold bg-blue-100':'text-gray-700'}`}
            >Questions</li>

           <li 
            onClick={() => handleNavigation('/dashboard/upgrade')}
            className={`hover:text-blue-600 hover:font-bold transition-all
            cursor-pointer py-2 px-3 rounded
            ${path=='/dashboard/upgrade'?'text-primary font-bold bg-blue-100':'text-gray-700'}`}
            >Upgrade</li>

           <li 
            onClick={() => handleNavigation('/dashboard/how')}
            className={`hover:text-blue-600 hover:font-bold transition-all
            cursor-pointer py-2 px-3 rounded
            ${path=='/dashboard/how'?'text-primary font-bold bg-blue-100':'text-gray-700'}`}
            >How it Works?</li>
        </ul>
        <div className='flex items-center gap-4'>
        <UserButton/>
        </div>
    </div>
  )
}

export default Header