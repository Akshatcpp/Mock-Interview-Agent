import { Lightbulb, Volume, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSection({ mockInterviewQuestions, activeQuestionIndex, setActiveQuestionIndex }) {
  
  const textToSpeech = (text) => {
   if('speechSynthesis' in window){
    window.speechSynthesis.cancel(); // Stop any currently playing speech
    const speech = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(speech);
   }
   else{
    alert('Sorry your browser does not support text to speech');
   }
  };

  return (
    <div className="p-5">
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
        {mockInterviewQuestions && mockInterviewQuestions.map((question, index) => (
          <div key={index} onClick={() => setActiveQuestionIndex(index)}>
            <h2 className={`p-3 rounded-lg text-xs md:text-sm text-center cursor-pointer font-medium transition-all border-2 ${
              activeQuestionIndex === index 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}>
              Question #{index + 1}
            </h2>
          </div>
        ))}
      </div>
      
      {mockInterviewQuestions && mockInterviewQuestions[activeQuestionIndex] && (
        <div className='mt-8 p-6 border-2 border-gray-300 rounded-lg bg-gray-50'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-semibold text-gray-800'>Question #{activeQuestionIndex + 1}</h3>
            <button
              onClick={() => textToSpeech(mockInterviewQuestions[activeQuestionIndex].question)}
              className='flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all'
              title='Read question aloud'
            >
              <Volume2 className='w-4 h-4' />
              Read
            </button>
          </div>
          <p className='text-lg text-gray-800 mb-6 leading-relaxed'>{mockInterviewQuestions[activeQuestionIndex].question}</p>
        </div>
      )}
      <div className='border rounded-lg p-5 bg-blue-100 mt-6'>
        <div className='flex gap-2 items-center text-primary mb-2'>
          <Lightbulb className='w-5 h-5'/>
          <strong>Note:</strong>
        </div>
        <p className='text-sm text-primary'>{process.env.NEXT_PUBLIC_QUESTION_NOTE}</p>
      </div>
    </div>
  )
}

export default QuestionsSection
