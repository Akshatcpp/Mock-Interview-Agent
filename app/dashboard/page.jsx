import { UserButton } from '@clerk/nextjs'
import React from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'

function Dashboard() {
  return (
    <div> 

      <div className='p-10'>
        <h2 className='font-bold text-3xl'>Dashboard</h2>
        <h2 className='text-gray-500 text-sm mt-2'>Create and Start your AI Mockup Interview</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 my-8 gap-6'>
          <AddNewInterview/>
        </div>
      </div>

      {/* Previous Interview List */}
      <InterviewList/>
    </div>
  )
}

export default Dashboard