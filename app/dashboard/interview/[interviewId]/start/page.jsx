"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import QuestionsSection from './components/QuestionsSection'
import RecordAnswerSection from './components/RecordAnswerSection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function StartInterview() {
  const params = useParams();
  const [interviewData,setInterviewData] =useState();
  const[mockInterviewQuestion,setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(()=>{
    if (params?.interviewId) {
      GetInterviewDetails();
    }
  },[params?.interviewId]);

   const GetInterviewDetails=async()=>{
      try {
          let result=await db.select().from(MockInterview)
          .where(eq(MockInterview.mockId,params.interviewId))
          
          // If not found by mockId, try by numeric id
          if (!result || result.length === 0) {
            result=await db.select().from(MockInterview)
            .where(eq(MockInterview.id,parseInt(params.interviewId)))
          }
          
          console.log("Query result:", result);
          
          if (result && result.length > 0) {
            setInterviewData(result[0]);
            const jsonMockResp =JSON.parse(result[0].jsonMockResp)
            setMockInterviewQuestion(jsonMockResp);
          } else {
            console.error("No interview found with ID:", params.interviewId);
          }
      } catch (error) {
        console.error("Error fetching interview details:", error);
      } finally {
        setLoading(false);
      }
      }

  if (loading) {
    return <div className='p-10'>Loading interview...</div>
  }

  if (!interviewData) {
    return <div className='p-10'>Interview not found</div>
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {/* Questions */}
        <QuestionsSection 
          mockInterviewQuestions={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          setActiveQuestionIndex={setActiveQuestionIndex}
        />

        {/* Video/Audio Recording */}
        <RecordAnswerSection
        mockInterviewQuestion={mockInterviewQuestion}
        activeQuestionIndex={activeQuestionIndex}
        interviewData={interviewData}
        />

      </div>
      <div className='flex justify-end gap-6 mt-6'>
        {activeQuestionIndex>0&&(
        <Button 
          onClick={()=>setActiveQuestionIndex(activeQuestionIndex-1)}
          variant="outline"
          className='px-6 border-gray-300 text-gray-700 hover:bg-gray-100'
        > 
          ← Previous Question 
        </Button>
        )}
        {activeQuestionIndex != mockInterviewQuestion?.length-1&&(
         <Button 
          onClick={()=>setActiveQuestionIndex(activeQuestionIndex+1)}
          className='px-6 bg-blue-600 hover:bg-blue-700 text-white'
         > 
          Next Question → 
         </Button>
        )}
       {activeQuestionIndex==mockInterviewQuestion?.length-1&&(
       <Link href={'/dashboard/interview/'+interviewData?.id+'/feedback'}>
       <Button className='px-6 bg-green-600 hover:bg-green-700 text-white'> 
        End Interview & Review 
       </Button>
       </Link>
       )}
      </div>
     
    </div>
  )
}

export default StartInterview