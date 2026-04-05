"use client"
import React, { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MockInterview } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { db } from '@/utils/db'
import { Plus, AlertCircle } from 'lucide-react'

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false)
    const [jobPosition, setJobPosition] = useState('')
    const [jobDesc, setJobDesc] = useState('')
    const [jobExperience, setJobExperience] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const router = useRouter();
    const { user } = useUser();

    const validateForm = () => {
      if (!jobPosition?.trim()) {
        setError('Please enter a job position');
        return false;
      }
      if (!jobDesc?.trim()) {
        setError('Please enter job description/tech stack');
        return false;
      }
      if (!jobExperience || jobExperience < 0 || jobExperience > 100) {
        setError('Please enter valid years of experience (0-100)');
        return false;
      }
      setError(null);
      return true;
    }

    const handleDialogChange = (open) => {
      setOpenDialog(open);
      if (!open) {
        setError(null);
        setJobPosition('');
        setJobDesc('');
        setJobExperience('');
      }
    }

    const onSubmit = async (e) => {
      e.preventDefault()
      
      if (!validateForm()) {
        return;
      }

      setLoading(true)
      setError(null)
      let mockId = null;
    
      try {
        const response = await fetch('/api/interview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobPosition,
            jobDescription: jobDesc,
            yearsOfExperience: jobExperience,
          }),
        })

        const data = await response.json()

        if (data.success) {
          try {
            // Clean the JSON string by removing backticks, newlines, and extra whitespace
            const cleanedJson = data.questions
              .replace(/^```json\s*/g, '')
              .replace(/\s*```$/g, '')
              .replace(/\n/g, ' ')
              .trim()
            
            const questions = JSON.parse(cleanedJson)
            console.log('Interview Questions:', questions)
            
            // Save to database
            if (user?.primaryEmailAddress?.emailAddress) {
              const newMockId = uuidv4();
              const resp = await db.insert(MockInterview)
                .values({
                  mockId: newMockId,
                  jsonMockResp: JSON.stringify(questions),
                  jobPosition: jobPosition,
                  jobDesc: jobDesc,
                  jobExperience: jobExperience,
                  createdBy: user.primaryEmailAddress.emailAddress,
                  createdAt: moment().format('DD-MM-YYYY')
                })
                .returning({ id: MockInterview.id })
              console.log("Inserted ID:", resp)
              if (resp && resp[0] && resp[0].id) {
                mockId = resp[0].id;
              }
            }
            
            setOpenDialog(false)
            toast.success('Interview created successfully! Redirecting...');
            
            if (mockId) {
              router.push('/dashboard/interview/' + mockId)
            }
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError)
            console.log('Raw response:', data.questions)
            setError('Failed to parse interview questions. Please try again.');
            toast.error('Error parsing interview questions');
          }
        } else {
          const errorMsg = data.error || 'Failed to generate interview questions';
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error('Error:', error)
        const errorMsg = error.message || 'Failed to start interview. Please check your connection and try again.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false)
      }
    }

  return (
    <div>
        <div 
          className='p-10 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 
          hover:scale-105 hover:shadow-md hover:bg-blue-100 cursor-pointer transition-all'
          onClick={() => handleDialogChange(true)}
        >
            <div className='flex items-center justify-center gap-2'>
              <Plus className='w-6 h-6 text-blue-600' />
              <h2 className='font-bold text-lg text-center text-blue-700'>Add New Interview</h2>
            </div>
        </div>

        <Dialog open={openDialog} onOpenChange={handleDialogChange}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create New Mock Interview</DialogTitle>
              <DialogDescription className="text-gray-600 mt-2">
                Provide details about the job position and we'll generate interview questions tailored to your role.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit}>
              <div className="space-y-5">
                {/* Job Position */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Job Role / Position *</label>
                  <Input 
                    placeholder="Ex. Full Stack Developer, Senior React Developer" 
                    className="text-base border-gray-300 focus:border-blue-500"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    disabled={loading}
                  />
                  <p className='text-xs text-gray-500 mt-1'>Enter the exact job position you're interviewing for</p>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tech Stack / Job Description *</label>
                  <Textarea 
                    placeholder="Ex. React, Next.js, TypeScript, Node.js, PostgreSQL, REST APIs, etc." 
                    className="text-base border-gray-300 focus:border-blue-500 min-h-24"
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    disabled={loading}
                  />
                  <p className='text-xs text-gray-500 mt-1'>List the key technologies and skills needed for the role</p>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Years of Experience *</label>
                  <Input 
                    placeholder="Ex. 0, 2, 5" 
                    type="number" 
                    min="0"
                    max="100"
                    className="text-base border-gray-300 focus:border-blue-500"
                    value={jobExperience}
                    onChange={(e) => setJobExperience(e.target.value)}
                    disabled={loading}
                  />
                  <p className='text-xs text-gray-500 mt-1'>Years of relevant experience for this position</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className='p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2'>
                    <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
                    <p className='text-sm text-red-700'>{error}</p>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className='flex gap-3 justify-end mt-8'>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleDialogChange(false)}
                  disabled={loading}
                  className='text-gray-700 border-gray-300'
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className='bg-blue-600 text-white hover:bg-blue-700 px-8 font-semibold'
                  disabled={loading || !jobPosition.trim() || !jobDesc.trim() || !jobExperience}
                >
                  {loading ? (
                    <span className='flex items-center gap-2'>
                      <span className='animate-spin'>⚙️</span>
                      Generating...
                    </span>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

    </div>
  )
}

export default AddNewInterview