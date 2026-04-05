import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import moment from "moment";

// Calculate rating based on answer quality metrics
function calculateRating(userAnswer, expectedAnswer) {
  const answerLength = userAnswer.trim().length;
  const wordCount = userAnswer.trim().split(/\s+/).length;
  
  let rating = 0;
  let feedback = "";

  // Check answer length and depth
  if (answerLength < 50) {
    rating = 2;
    feedback = "Your answer is too brief. Provide more detailed explanation with examples.";
  } else if (answerLength < 150) {
    rating = 4;
    feedback = "Good start, but the answer could be more comprehensive. Add more technical details or examples.";
  } else if (answerLength < 300) {
    rating = 6;
    feedback = "Decent answer with reasonable depth. Consider adding more specific examples or edge cases.";
  } else if (answerLength < 500) {
    rating = 7;
    feedback = "Good comprehensive answer. You've covered the main points with reasonable detail.";
  } else {
    rating = 8;
    feedback = "Excellent detailed answer. You've provided comprehensive explanation with good structure.";
  }

  // Bonus for expected answer match (if available)
  if (expectedAnswer && expectedAnswer !== "Answer not provided") {
    const expectedWords = expectedAnswer.toLowerCase().split(/\s+/);
    const userWords = userAnswer.toLowerCase().split(/\s+/);
    
    // Calculate keyword overlap
    const commonWords = expectedWords.filter(w => 
      w.length > 4 && userWords.some(uw => uw.includes(w) || w.includes(uw))
    ).length;
    
    const keywordMatch = (commonWords / Math.max(expectedWords.length, 1)) * 100;
    
    // Adjust rating based on keyword match
    if (keywordMatch > 60) {
      rating = Math.min(9, rating + 1);
      feedback = "Excellent! Your answer aligns very well with the expected answer. Great job! ✓";
    } else if (keywordMatch > 40) {
      rating = Math.min(9, rating);
      feedback = "Good understanding demonstrated. Your answer covers the main concepts mentioned in the expected answer.";
    } else if (keywordMatch > 20) {
      rating = Math.max(3, rating - 1);
      feedback = "You've covered some key points but missed several important concepts. Review the expected answer.";
    } else {
      rating = Math.max(2, rating - 2);
      feedback = "Your answer doesn't align well with the expected answer. Study the expected answer and try to incorporate those concepts.";
    }
  }

  return {
    rating: Math.max(1, Math.min(10, rating)),
    feedback: feedback
  };
}

export async function POST(req) {
  try {
    const {
      question,
      correctAnswer,
      userAnswer,
      userEmail,
      mockIdRef,
      questionId,
    } = await req.json();

    // Validate required fields
    if (!userAnswer || userAnswer.trim().length < 10) {
      return Response.json(
        { error: "Answer too short (minimum 10 characters required)" },
        { status: 400 }
      );
    }

    if (questionId === undefined || questionId === null) {
      return Response.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    if (!question) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!mockIdRef) {
      return Response.json(
        { error: "Interview ID (mockIdRef) is required" },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return Response.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Calculate rating and feedback based on answer quality
    const { rating, feedback } = calculateRating(userAnswer.trim(), correctAnswer);

    // Save to database
    const resp = await db.insert(UserAnswer).values({
      mockIdRef: mockIdRef,
      questionId: questionId,
      question: question,
      correctAns: correctAnswer || "Answer not provided",
      userAns: userAnswer.trim(),
      feedback: feedback,
      rating: rating.toString(),
      userEmail: userEmail,
      createdAt: moment().format("DD-MM-YYYY"),
    });

    return Response.json({
      success: true,
      message: "Answer saved successfully",
      questionId: questionId,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: error.message || "Failed to save answer" },
      { status: 500 }
    );
  }
}
