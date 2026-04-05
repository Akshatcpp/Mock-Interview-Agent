
"use client"

import { MockInterview } from '@/utils/schema'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState } from 'react'
import { Lightbulb, WebcamIcon } from 'lucide-react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function Interview({params}) {
    const resolvedParams = React.use(params);
    const [interviewData,setInterviewData]=useState();
    const [webCamEnabled,setWebCamEnabled]=useState(false)
    useEffect(()=>{
        console.log(resolvedParams.interviewId)
        GetInterviewDetails();
    },[resolvedParams.interviewId])

    //used to get interview details by mockinterview ID

    const GetInterviewDetails=async()=>{

        const result=await db.select().from(MockInterview)

        .where(eq(MockInterview.mockId,resolvedParams.interviewId))
        console.log(result);
        setInterviewData(result[0]);
    }
  return (
    <div className='my-10 px-5 max-w-6xl mx-auto'>
        <h2 className='font-bold text-2xl mb-10'>Let's Get Started</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          {/* Left Section - Job Details */}
          <div className='flex flex-col gap-5'>
            {interviewData ? (
              <>
                <div className='p-6 border border-gray-300 rounded-lg bg-white shadow-sm'>
                  <h3 className='text-base mb-3'><strong>Job Role/Job Position:</strong> {interviewData.jobPosition}</h3>
                  <h3 className='text-base mb-3'><strong>Job Description/Tech Stack:</strong> {interviewData.jobDesc}</h3>
                  <h3 className='text-base'><strong>Years of Experience:</strong> {interviewData.jobExperience}</h3>
                </div>
                
                {/* Info Box */}
                <div className='p-5 rounded-lg bg-yellow-100 border border-yellow-300'>
                  <div className='flex gap-3'>
                    <Lightbulb className='text-yellow-600 flex-shrink-0 mt-1' size={20} />
                    <div>
                      <p className='text-yellow-800 font-semibold mb-2'>Information</p>
                      <p className='text-yellow-800 text-sm'>
                        Enable Video Web Cam and Microphone to Start your AI Generated Mock Interview. It Has {process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5} question which you can answer and at the last you will get the report on the basis of your answer. NOTE: We never record your video , Web cam access you can disable at any time if you want
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='text-center py-10'>
                <p className='text-gray-500'>Loading interview details...</p>
              </div>
            )}
          </div>

          {/* Right Section - Webcam */}
          <div className='flex flex-col items-center justify-start gap-6'>
            {webCamEnabled ? (
              <Webcam
                onUserMedia={() => setWebCamEnabled(true)}
                onUserMediaError={() => setWebCamEnabled(false)}
                mirrored={true}
                style={{
                  height: 300,
                  width: 300,
                  borderRadius: '8px'
                }}
              />
            ) : (
              <div className='h-72 w-72 flex items-center justify-center bg-gray-200 rounded-lg border border-gray-300'>
                <WebcamIcon className='h-24 w-24 text-gray-400' />
              </div>
            )}
            
            <div className='w-full flex flex-col gap-3 items-center'>
              <p className='text-gray-700 font-medium'>Enable Web Cam and Microphone</p>
              {!webCamEnabled && (
                <Button 
                  onClick={() => setWebCamEnabled(true)}
                  className='px-8 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300'
                >
                  Enable Web Cam and Microphone
                </Button>
              )}
            </div>
              <Link href={'/dashboard/interview/'+resolvedParams.interviewId+'/start'}>
            <Button className='w-48 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2'>
              
              Start Interview
            </Button>
            </Link>
          </div>
        </div>
    </div>
  )
}

export default Interview