'use client'
import dynamic from 'next/dynamic'

// Dynamically import the entire component to avoid server-side window access
const RecordAnswerSectionContent = dynamic(
  () => import('./RecordAnswerSectionContent'),
  { ssr: false, loading: () => <div className="p-6">Loading recording interface...</div> }
)

export default function RecordAnswerSection(props) {
  return <RecordAnswerSectionContent {...props} />
}