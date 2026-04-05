"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs';
import InterviewItemCard from './InterviewItemCard';

function InterviewList() {

    const {user}=useUser();
    const [interviewList,setInterviewList]=useState([]);

    useEffect(()=>{
            user&&GetInterviewList();
    },[user])

    const GetInterviewList=async()=>{
        const result=await db.select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(MockInterview.id))

        console.log(result);
        setInterviewList(result);
    }
  return (
    <div className='p-10'>
        <h2 className='font-medium text-xl mb-6'>
            Previous Mock Interviews
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {interviewList && interviewList.length > 0 ? (
                interviewList.map((interview)=>(
                    <InterviewItemCard key={interview.id} interview={interview} />
                ))
            ) : (
                <p className='text-gray-500'>No interviews created yet</p>
            )}
        </div>
    </div>
  )
}

export default InterviewList
