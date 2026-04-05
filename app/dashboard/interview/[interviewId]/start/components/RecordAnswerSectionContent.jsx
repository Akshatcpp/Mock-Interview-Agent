'use client'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text'
import React, { useRef, useState, useEffect } from 'react'
import { Mic, MicOff, Volume2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

function RecordAnswerSectionContent({mockInterviewQuestion, activeQuestionIndex, interviewData}) {
  
  const {user} = useUser();
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [recordedAnswers, setRecordedAnswers] = useState({}); // Track answers per question
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Get unique key for current question
  const questionKey = `q_${activeQuestionIndex}`;

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  })

  const webcamRef = useRef(null)

  // Update transcript display
  useEffect(() => {
    const fullTranscript = results.map(result => result.transcript).join(' ')
    const currentAnswer = fullTranscript + (interimResult ? ' ' + interimResult : '')
    setUserAnswer(currentAnswer)
  }, [results, interimResult])

  // Reset recorder state when question changes
  useEffect(() => {
    // Stop any ongoing recording
    if (isRecording) {
      stopSpeechToText();
    }

    // Reset form for new question
    const existingAnswer = recordedAnswers[questionKey];
    setUserAnswer(existingAnswer || '');
    setIsSubmitted(!!existingAnswer);
    
  }, [activeQuestionIndex])

  const handleStartRecording = () => {
    startSpeechToText()
  }

  const handleStopRecording = () => {
    stopSpeechToText()
  }

  const SaveUserAnswer = async() => {
    if(!isRecording) {
      setLoading(true);
      
      try {
        if(!userAnswer || userAnswer.trim().length < 10) {
          toast.error('Please record a longer answer (at least 10 characters)')
          setLoading(false);
          return;
        }

        // Call backend API to save answer and get feedback
        const response = await fetch('/api/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: mockInterviewQuestion[activeQuestionIndex]?.question,
            correctAnswer: mockInterviewQuestion[activeQuestionIndex]?.expectedAnswer,
            userAnswer: userAnswer.trim(),
            userEmail: user?.primaryEmailAddress?.emailAddress,
            mockIdRef: interviewData?.mockId,
            questionId: activeQuestionIndex, // Send questionId
          })
        })

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save answer');
        }

        const result = await response.json();
        
        if(result.success) {
          // Store the answer in recordedAnswers to prevent re-recording
          setRecordedAnswers(prev => ({
            ...prev,
            [questionKey]: userAnswer
          }));
          setIsSubmitted(true);
          toast.success('Answer recorded successfully!');
        }
      } catch (error) {
        console.error('Error saving answer:', error)
        toast.error('Error saving answer. Please try again.')
      } finally {
        setLoading(false);
      }
    } else {
      stopSpeechToText();
    }
  }

  const handleReRecord = () => {
    setUserAnswer('');
    setIsSubmitted(false);
  }

  return (
    <div className='flex flex-col justify-center items-center rounded-lg p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 h-full overflow-y-auto'>
      {/* Header */}
      <div className='w-full mb-6'>
        <h3 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
          <Volume2 className='w-5 h-5 text-blue-600' />
          Record Your Answer
        </h3>
        <p className='text-sm text-gray-600 mt-1'>Question {activeQuestionIndex + 1} of {mockInterviewQuestion?.length}</p>
      </div>

      {/* Webcam Container */}
      <div className='w-full rounded-lg overflow-hidden border-4 border-blue-400 shadow-lg mb-6 bg-black'>
        <Webcam
          ref={webcamRef}
          className='w-full h-auto'
          mirrored={true}
        />
      </div>

      {/* Recording Status */}
      <div className='w-full flex items-center justify-between mb-6 px-2'>
        <div className='flex items-center gap-2'>
          {isRecording && (
            <>
              <div className='w-3 h-3 bg-red-600 rounded-full animate-pulse'></div>
              <span className='text-sm font-semibold text-red-600'>Recording...</span>
            </>
          )}
          {!isRecording && isSubmitted && (
            <>
              <CheckCircle className='w-4 h-4 text-green-600' />
              <span className='text-sm text-green-600'>Answer submitted</span>
            </>
          )}
          {!isRecording && userAnswer.length > 0 && !isSubmitted && (
            <>
              <CheckCircle className='w-4 h-4 text-yellow-600' />
              <span className='text-sm text-yellow-600'>Recording ready to submit</span>
            </>
          )}
          {!isRecording && userAnswer.length === 0 && !isSubmitted && (
            <span className='text-sm text-gray-600'>Ready to record</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className='w-full flex gap-3 justify-center mb-6 flex-wrap'>
        <button
          onClick={handleStartRecording}
          disabled={isRecording || isSubmitted}
          className='flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed'
        >
          <Mic className='w-4 h-4' />
          Start Recording
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!isRecording}
          className='flex items-center gap-2 px-6 py-2.5 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed'
        >
          <MicOff className='w-4 h-4' />
          Stop Recording
        </button>
        {userAnswer && !isSubmitted && (
          <button
            onClick={handleReRecord}
            disabled={isRecording}
            className='flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed'
          >
            Re-record
          </button>
        )}
      </div>

      {/* Transcript Display */}
      {userAnswer && (
        <div className='w-full mb-6 p-4 bg-white rounded-lg border-2 border-gray-300'>
          <div className='flex items-start gap-2 mb-2'>
            <Volume2 className='w-4 h-4 text-blue-600 mt-1 flex-shrink-0' />
            <p className='text-sm text-gray-600'>
              <strong>Your Answer:</strong>
            </p>
          </div>
          <p className='text-sm text-gray-800 leading-relaxed'>{userAnswer}</p>
          <p className='text-xs text-gray-500 mt-2'>{userAnswer.length} characters</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className='w-full flex flex-col gap-2'>
        <Button 
          onClick={SaveUserAnswer}
          disabled={loading || isRecording || !userAnswer || isSubmitted}
          className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
        >
          {loading ? 'Processing...' : isSubmitted ? 'Answer Submitted ✓' : 'Submit Answer'}
        </Button>
        {isSubmitted && (
          <div className='w-full p-3 bg-green-100 border-l-4 border-green-600 rounded flex items-start gap-2'>
            <CheckCircle className='w-5 h-5 text-green-700 mt-0.5 flex-shrink-0' />
            <div>
              <p className='text-sm text-green-700 font-semibold'>Answer Recorded</p>
              <p className='text-xs text-green-600'>This answer has been saved. You can move to the next question or re-record if needed.</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className='w-full mt-4 p-3 bg-red-100 border-l-4 border-red-600 rounded flex items-start gap-2'>
          <AlertCircle className='w-5 h-5 text-red-700 mt-0.5 flex-shrink-0' />
          <div>
            <p className='text-sm text-red-700'><strong>Recording Error:</strong></p>
            <p className='text-xs text-red-600'>{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecordAnswerSectionContent
