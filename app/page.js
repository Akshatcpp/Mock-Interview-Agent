import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Zap, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className='flex p-4 items-center justify-between bg-white shadow-sm sticky top-0 z-50'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-blue-600 rounded-lg'></div>
          <span className='font-bold text-xl text-gray-800'>PrepMaster</span>
        </div>
        <div className='flex items-center gap-4'>
          <Link href="/dashboard">
            <Button variant="ghost" className='text-gray-700 hover:text-blue-600'>Dashboard</Button>
          </Link>
          <Link href="/sign-in">
            <Button className='bg-blue-600 hover:bg-blue-700 text-white'>Sign In</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className='max-w-6xl mx-auto px-4 py-16 md:py-24'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'>
            Master Your Interview Skills with <span className='text-blue-600'>AI-Powered Mock Interviews</span>
          </h1>
          <p className='text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
            Practice with real job questions, get instant feedback, and build confidence for your dream job.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href="/dashboard">
              <Button className='bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold flex items-center gap-2'>
                Start Interview <ArrowRight className='w-5 h-5' />
              </Button>
            </Link>
            <Button variant="outline" className='px-8 py-6 text-lg font-semibold border-gray-300'>
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className='grid md:grid-cols-3 gap-8 mb-16'>
          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
              <Zap className='w-6 h-6 text-blue-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>AI-Generated Questions</h3>
            <p className='text-gray-600'>Get personalized interview questions based on your role and experience level.</p>
          </div>

          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4'>
              <Target className='w-6 h-6 text-green-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>Instant Feedback</h3>
            <p className='text-gray-600'>Receive detailed analysis of your responses with areas for improvement.</p>
          </div>

          <div className='bg-white p-8 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow'>
            <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4'>
              <Users className='w-6 h-6 text-purple-600' />
            </div>
            <h3 className='text-xl font-bold text-gray-900 mb-2'>Track Progress</h3>
            <p className='text-gray-600'>Track your interview attempts and see improvements over time.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white'>
          <h2 className='text-3xl font-bold mb-4'>Ready to ace your interview?</h2>
          <p className='text-lg opacity-90 mb-6 max-w-xl mx-auto'>
            Join thousands of professionals who have successfully prepared with PrepMaster.
          </p>
          <Link href="/dashboard">
            <Button className='bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold'>
              Get Started for Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
