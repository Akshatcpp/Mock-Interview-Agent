# Interview Recorder & Response Handling - Fix Summary

## Issues Fixed

### 1. **Recorder Continues from Previous Question**
**Problem:** When users moved to a new question, the speech-to-text results from the previous question were not cleared, causing the recorder to append to the old transcript.

**Solution:**
- Added `useEffect` hook that triggers when `activeQuestionIndex` changes
- Automatically stops any active recording using `stopSpeechToText()`
- Resets the `userAnswer` state based on what's already recorded for that question
- Prevents state leakage between questions

```javascript
useEffect(() => {
  if (isRecording) {
    stopSpeechToText();
  }
  const existingAnswer = recordedAnswers[questionKey];
  setUserAnswer(existingAnswer || '');
  setIsSubmitted(!!existingAnswer);
}, [activeQuestionIndex])
```

---

### 2. **Responses Not Submitted Separately for Each Question**
**Problem:** The system wasn't tracking which question each response belonged to, and responses could overwrite each other.

**Solution:**
- Added `recordedAnswers` state object to track responses per question using question index as key
- Each question gets a unique key: `q_${activeQuestionIndex}`
- When a response is submitted, it's stored in the `recordedAnswers` map with its question key
- Users cannot re-record once an answer is submitted for that question (until they click re-record)
- Updated database schema to include `questionId` field for question-wise tracking

```javascript
const recordedAnswers = {}; // { q_0: "answer text", q_1: "answer text" }
```

---

### 3. **Final Review Mixing All Answers**
**Problem:** The feedback page wasn't clearly distinguishing between different questions' answers because all were displayed the same way.

**Solution:**
- Updated feedback UI to show question number first
- Added total question count display
- Improved visual hierarchy with better styling and spacing
- Each question feedback is now clearly separated and numbered
- Better color coding for different sections (yellow for rating, red for user answer, green for expected answer, blue for feedback)

---

## Database Schema Changes

### Updated `UserAnswer` Table
Added `questionId` field to track which question each response belongs to:

```javascript
export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  questionId: serial('questionId'), // ← NEW: tracks question index
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt'),
})
```

---

## API Changes

### POST `/api/answer` - Enhanced with QuestionId

**New Parameters:**
- `questionId` (required): Index of the question being answered (0-based)

**Request Example:**
```json
{
  "question": "What is React?",
  "correctAnswer": "A JavaScript library...",
  "userAnswer": "User's spoken answer...",
  "userEmail": "user@example.com",
  "mockIdRef": "uuid-12345",
  "questionId": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Answer saved successfully",
  "questionId": 0
}
```

---

## Component Changes - RecordAnswerSectionContent.jsx

### Key Improvements

1. **State Management:**
   - `recordedAnswers`: Tracks all submitted answers per question
   - `isSubmitted`: Tracks if current question's answer is submitted
   - `questionKey`: Unique identifier for each question

2. **Question Change Handling:**
   - Stops active recording when question changes
   - Restores previous answer if user clicks back to a question they already answered
   - Prevents re-recording a submitted answer unless user clicks "Re-record"

3. **Better UX:**
   - Shows "Question X of Y" indicator
   - Clear visual feedback for recording status
   - "Re-record" button appears after submission
   - Character count display for submitted answers
   - Improved toast notifications with emoji and better messages
   - Better error handling and display

4. **Event Handlers:**
   - `SaveUserAnswer()`: Now includes questionId in API call
   - `handleReRecord()`: Allows users to discard a submitted answer and re-record
   - Updated validation to trim and check answer length properly

### UI Enhancements
- Question progress indicator (e.g., "Question 1 of 5")
- Re-record button when answer is submitted
- Improved status display logic
- Better visual feedback for submitted state
- Error and success alerts with icons

---

## Feedback Page Changes

### Improved Display (`feedback/page.jsx`)

1. **Better Question Identification:**
   - Shows "Question 1:", "Question 2:", etc.
   - Clear question text display with proper styling

2. **Summary Information:**
   - Added "Total Questions Answered: X"
   - Better instructions

3. **Visual Improvements:**
   - Unique colored boxes for each section:
     - Gold/Yellow for rating
     - Red for user's answer
     - Green for expected answer
     - Blue for feedback
   - Better spacing and typography
   - Hover effects on collapsible triggers

4. **Better Content Display:**
   - `leading-relaxed` for better text readability
   - `mt-2` for spacing between labels and content
   - Proper border styling with matching colors

---

## Data Flow Summary

### Before (Broken)
```
Question 1 → Record → Submit → API saves ↘
Question 2 → Record (APPENDS to Q1) → Submit → Overwrite in DB ← BAD
Question 3 → Feedback shows mixed answers ← WRONG
```

### After (Fixed)
```
Question 1 → Record → Submit → API saves { questionId: 0, ... } ✓
Question 2 → Record (FRESH START) → Submit → API saves { questionId: 1, ... } ✓
Question 3 → Feedback shows Q1 answers + Feedback, Q2 answers + Feedback, etc. ✓
```

---

## How to Test

1. **Start an Interview:**
   - Navigate to an interview
   - Open the recording interface

2. **Test Recorder Reset:**
   - Record answer for Question 1
   - Move to Question 2
   - Verify the answer field is empty/fresh

3. **Test Response Tracking:**
   - Record and submit Answer 1
   - Move to Question 2
   - Record and submit Answer 2
   - Move back to Question 1
   - Verify your Answer 1 is still displayed
   - Try clicking "Re-record" to record a new answer

4. **Test Feedback Display:**
   - Complete all questions
   - Go to feedback page
   - Verify each question shows its own feedback, not mixed answers

---

## Files Modified

1. ✅ `utils/schema.js` - Added questionId field
2. ✅ `app/api/answer/route.js` - Updated to save and validate questionId
3. ✅ `app/dashboard/interview/[interviewId]/start/components/RecordAnswerSectionContent.jsx` - Complete component rewrite with fixes
4. ✅ `app/dashboard/interview/[interviewId]/feedback/page.jsx` - Improved UI and display logic

---

## Technical Stack

- **Frontend:** React + Next.js
- **Speech Recognition:** `react-hook-speech-to-text` (Web Speech API wrapper)
- **Database:** Drizzle ORM with PostgreSQL
- **UI Components:** Custom + Shadcn/ui

---

## Potential Future Improvements

1. Add audio file storage for better playback
2. Implement real-time feedback generation (once Gemini API is fixed)
3. Add progress indicator showing completion status per question
4. Add timer for question responses
5. Add ability to skip questions and come back to them
6. Add download/export of interview results
