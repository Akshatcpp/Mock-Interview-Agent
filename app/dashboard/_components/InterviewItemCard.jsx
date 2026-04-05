import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

function InterviewItemCard({interview}) {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/dashboard/interview/${interview.id}/start`);
  };

  const handleFeedback = () => {
    router.push(`/dashboard/interview/${interview.id}/feedback`);
  };

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white hover:shadow-lg transition-shadow'>
      <div className='mb-4'>
        <h3 className='text-lg font-bold text-primary mb-1'>
          {interview.jobPosition}
        </h3>
        <p className='text-sm text-gray-600 mb-2'>
          {interview.jobDesc}
        </p>
        <p className='text-xs text-gray-500'>
          Created At: {interview.createdAt}
        </p>
      </div>
      <div className='flex gap-3 justify-between'>
        <Button 
          onClick={handleFeedback}
          variant='outline'
          className='flex-1'
        >
          Feedback
        </Button>
        <Button 
          onClick={handleStart}
          className='flex-1 bg-primary hover:bg-blue-700'
        >
          Start
        </Button>
      </div>
    </div>
  )
}

export default InterviewItemCard