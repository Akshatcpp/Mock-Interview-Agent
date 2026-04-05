const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Get available models
async function getAvailableModel() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await response.json();
    const models = data.models || [];
    
    // Look for a working model
    for (const model of models) {
      if (model.name.includes("gemini")) {
        return model.name.split("/").pop(); // Extract model name
      }
    }
    
    // Fallback to gemini-1.0-pro
    return "gemini-1.0-pro";
  } catch (error) {
    console.error("Error fetching models:", error);
    return "gemini-1.0-pro";
  }
}

export async function generateInterviewQuestion(jobPosition, jobDescription, yearsOfExp, questionCount = 5) {
  try {
    const model = await getAvailableModel();
    
    const prompt = `You are an expert technical interviewer. Generate ${questionCount} interview questions for:

Role: ${jobPosition}
Tech Stack: ${jobDescription}
Experience: ${yearsOfExp} years

Return ONLY a JSON array like this:
[
  {"question": "question here", "expectedAnswer": "answer here"},
  {"question": "question here", "expectedAnswer": "answer here"}
]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    const text = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    return {
      success: true,
      questions: text,
    };
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function generateInterviewFeedback(question, userAnswer, jobPosition) {
  try {
    const model = await getAvailableModel();
    
    const prompt = `You are an expert technical interviewer evaluating a candidate's response for a ${jobPosition} position.

Question: ${question}
Candidate's Answer: ${userAnswer}

Provide: score (1-10), strengths, improvements, betterAnswer
Format as JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    const text = data.candidates[0].content.parts[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    return {
      success: true,
      feedback: text,
    };
  } catch (error) {
    console.error("Gemini Error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
