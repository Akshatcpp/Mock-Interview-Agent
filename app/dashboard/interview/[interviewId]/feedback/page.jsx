"use client"
import { UserAnswer } from '@/utils/schema'
import React, { useEffect, useState } from 'react'
import { db } from '@/utils/db'
import { eq } from 'drizzle-orm'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MockInterview } from '@/utils/schema'

function Feedback() {
    const params = useParams();
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    
    useEffect(() => {
        if (params?.interviewId) {
            GetFeedback();
        }
    }, [params?.interviewId])

    const GetFeedback = async () => {
        try {
            setError(null);
            let mockIdRef = null;
            
            console.log("Interview ID from URL:", params.interviewId);
            
            try {
              const interviewResult = await db.select().from(MockInterview)
              .where(eq(MockInterview.id, parseInt(params.interviewId)))
              
              console.log("Interview lookup result:", interviewResult);
              
              if (interviewResult && interviewResult.length > 0) {
                mockIdRef = interviewResult[0].mockId;
                console.log("Found mockId:", mockIdRef);
              } else {
                console.log("No interview found by numeric ID");
                setError("Interview not found. Please try again.");
              }
            } catch (e) {
              console.log("Error fetching interview by numeric ID:", e);
              mockIdRef = params.interviewId;
            }
            
            if (!mockIdRef) {
              console.error("Could not find or determine interview ID");
              setError("Unable to load interview data");
              setFeedbackList([]);
              setLoading(false);
              return;
            }
            
            // Now fetch user answers using the mockId
            console.log("Querying user answers with mockIdRef:", mockIdRef);
            try {
              const result = await db.select()
              .from(UserAnswer)
              .where(eq(UserAnswer.mockIdRef, mockIdRef))
              
              console.log("User answers found:", result);
              
              if (!result || result.length === 0) {
                setError("No answers recorded for this interview");
                setFeedbackList([]);
              } else {
                // Sort by questionId to maintain order
                const sorted = [...result].sort((a, b) => (a.questionId || 0) - (b.questionId || 0));
                setFeedbackList(sorted);
              }
            } catch (queryError) {
              console.error("Database query failed:", queryError);
              setError("Failed to load feedback. Please refresh and try again.");
              setFeedbackList([]);
            }
        } catch (error) {
            console.error("Error in GetFeedback:", error);
            setError("An unexpected error occurred");
            setFeedbackList([]);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-10'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-2'>
              <CheckCircle className='w-8 h-8 text-green-600' />
              <h2 className='text-3xl md:text-4xl font-bold text-green-600'>Congratulations!</h2>
            </div>
            <h2 className='font-bold text-2xl md:text-3xl text-gray-800 mb-2'>Interview Feedback & Results</h2>
            <p className='text-gray-600'>Review your performance and areas for improvement</p>
          </div>

          {/* Error State */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
              <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-red-900 font-semibold'>Error Loading Feedback</p>
                <p className='text-red-700 text-sm mt-1'>{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='p-4 bg-white rounded-lg border border-gray-200 animate-pulse'>
                  <div className='h-12 bg-gray-200 rounded mb-3'></div>
                  <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                </div>
              ))}
            </div>
          ) : feedbackList?.length === 0 ? (
            <div className='bg-white p-8 rounded-lg border border-gray-200 text-center'>
              <AlertCircle className='w-12 h-12 text-yellow-600 mx-auto mb-3' />
              <h2 className='font-bold text-xl text-gray-800 mb-2'>No Answers Recorded</h2>
              <p className='text-gray-600 mb-6'>It looks like you haven't recorded any answers for this interview yet.</p>
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Summary Stats */}
              <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>Interview Summary</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-blue-600'>{feedbackList.length}</p>
                    <p className='text-sm text-gray-600 mt-1'>Total Questions</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-purple-600'>
                      {(feedbackList.reduce((sum, f) => sum + (parseInt(f.rating) || 0), 0) / feedbackList.length).toFixed(1)}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>Average Score</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-green-600'>
                      {feedbackList.filter(f => parseInt(f.rating) >= 7).length}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>Good Answers</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-orange-600'>
                      {feedbackList.filter(f => parseInt(f.rating) < 7).length}
                    </p>
                    <p className='text-sm text-gray-600 mt-1'>Need Improvement</p>
                  </div>
                </div>
              </div>

              {/* Feedback Items */}
              <div className='space-y-3'>
                <h3 className='text-lg font-semibold text-gray-800'>Detailed Feedback</h3>
                {feedbackList && feedbackList.map((item, index) => {
                  // Determine rating color and status
                  const ratingNum = parseInt(item.rating);
                  let ratingColor = 'bg-yellow-100 text-yellow-800';
                  let ratingBgColor = 'bg-yellow-50 border-yellow-300';
                  let ratingStatus = 'Average';
                  
                  if (ratingNum >= 8) {
                    ratingColor = 'bg-green-100 text-green-800';
                    ratingBgColor = 'bg-green-50 border-green-300';
                    ratingStatus = 'Excellent';
                  } else if (ratingNum >= 6) {
                    ratingColor = 'bg-blue-100 text-blue-800';
                    ratingBgColor = 'bg-blue-50 border-blue-300';
                    ratingStatus = 'Good';
                  } else if (ratingNum >= 4) {
                    ratingColor = 'bg-orange-100 text-orange-800';
                    ratingBgColor = 'bg-orange-50 border-orange-300';
                    ratingStatus = 'Fair';
                  } else {
                    ratingColor = 'bg-red-100 text-red-800';
                    ratingBgColor = 'bg-red-50 border-red-300';
                    ratingStatus = 'Needs Improvement';
                  }
                  
                  return (
                  <Collapsible key={index} className='mb-1'>
                    <CollapsibleTrigger className='p-4 bg-white rounded-lg flex justify-between items-center w-full text-left gap-7 hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm' >
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-1'>
                          <span className='font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded text-sm'>Q{index + 1}</span>
                          <span className='font-semibold text-gray-700 truncate text-sm'>{item.question}</span>
                        </div>
                        <div className='flex gap-3 mt-2 flex-wrap'>
                          <span className={`text-xs px-3 py-1 rounded font-semibold ${ratingColor}`}>
                            ⭐ {ratingStatus} ({ratingNum}/10)
                          </span>
                        </div>
                      </div>
                      <ChevronsUpDown className='h-5 w-5 flex-shrink-0 text-gray-400'/>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                       <div className='flex flex-col gap-3 mt-2 ml-2 p-4 bg-gray-50 rounded-lg border border-gray-200 border-t-0'>
                        <div className={`p-3 border rounded-lg ${ratingBgColor}`}>
                          <div className='flex items-center justify-between mb-2'>
                            <strong className={ratingColor}>Performance Rating</strong>
                            <span className='text-lg font-bold'>{ratingNum}/10</span>
                          </div>
                          <div className='w-full bg-gray-300 rounded-full h-2'>
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                ratingNum >= 8 ? 'bg-green-600' :
                                ratingNum >= 6 ? 'bg-blue-600' :
                                ratingNum >= 4 ? 'bg-orange-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${(ratingNum / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className='p-3 border rounded-lg bg-red-50 border-red-300'>
                          <strong className='text-red-900'>Your Answer:</strong>
                          <p className='text-sm text-red-800 mt-2 leading-relaxed'>{item.userAns || 'No answer recorded'}</p>
                        </div>
                        <div className='p-3 border rounded-lg bg-green-50 border-green-300'>
                          <strong className='text-green-900'>Expected Answer:</strong>
                          <p className='text-sm text-green-800 mt-2 leading-relaxed'>
                            {item.correctAns ? item.correctAns : <span className='italic text-green-600'>Answer details will be added soon</span>}
                          </p>
                        </div>
                        <div className='p-3 border rounded-lg bg-blue-50 border-blue-300'>
                          <strong className='text-blue-900'>Feedback & Areas for Improvement:</strong>
                          <p className='text-sm text-blue-800 mt-2 leading-relaxed'>{item.feedback || 'Feedback pending'}</p>
                        </div>
                       </div>
                    </CollapsibleContent>
                  </Collapsible>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex gap-4 mt-8 flex-wrap'>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2'
            >
              Back to Dashboard
            </Button>
            {!loading && feedbackList.length > 0 && (
              <Button 
                onClick={() => window.print()} 
                variant="outline"
                className='px-6 py-2'
              >
                Print Results
              </Button>
            )}
          </div>
        </div>
    </div>
  )
}

export default Feedback