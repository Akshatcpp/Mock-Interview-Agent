import { generateInterviewQuestion } from "@/utils/gemini";

export async function POST(req) {
  try {
    const { jobPosition, jobDescription, yearsOfExperience } = await req.json();

    if (!jobPosition || !jobDescription || !yearsOfExperience) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await generateInterviewQuestion(
      jobPosition,
      jobDescription,
      yearsOfExperience
    );

    if (!result.success) {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
