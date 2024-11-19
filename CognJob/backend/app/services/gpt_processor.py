import openai
from typing import Optional
from pydantic import BaseModel
from app.core.config import Settings

settings = Settings()
openai.api_key = settings.OPENAI_API_KEY

class GPTConfig(BaseModel):
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: int = 150
    presence_penalty: float = 0.0
    frequency_penalty: float = 0.0

class GPTProcessor:
    def __init__(self, config: Optional[GPTConfig] = None):
        self.config = config or GPTConfig()
        self.conversation_history = []
        self.max_history = 10

    def _create_prompt(self, transcript: str) -> str:
        """Create a prompt for GPT based on the transcript."""
        return f"""As an AI assistant in a real-time conversation, respond naturally and concisely to this transcript:

Transcript: {transcript}

Provide a direct and contextually appropriate response, making sure to:
1. Address any questions or concerns raised
2. Maintain a helpful and professional tone
3. Keep the response focused and relevant

Response:"""

    async def generate_response(self, transcript: str) -> str:
        """Generate a response using GPT-3.5."""
        try:
            # Update conversation history
            self.conversation_history.append({"role": "user", "content": transcript})
            if len(self.conversation_history) > self.max_history:
                self.conversation_history.pop(0)

            # Create messages for the API call
            messages = [
                {"role": "system", "content": "You are a helpful assistant in a real-time conversation."},
                *self.conversation_history
            ]

            # Generate response
            response = await openai.ChatCompletion.acreate(
                model=self.config.model,
                messages=messages,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                presence_penalty=self.config.presence_penalty,
                frequency_penalty=self.config.frequency_penalty
            )

            # Extract and clean response
            response_text = response.choices[0].message.content.strip()
            self.conversation_history.append({"role": "assistant", "content": response_text})

            return response_text

        except Exception as e:
            print(f"Error generating GPT response: {e}")
            return "I apologize, but I'm having trouble generating a response at the moment."

    async def analyze_sentiment(self, transcript: str) -> dict:
        """Analyze the sentiment of the transcript."""
        try:
            response = await openai.ChatCompletion.acreate(
                model=self.config.model,
                messages=[
                    {"role": "system", "content": "Analyze the sentiment of this text and return a JSON with sentiment scores."},
                    {"role": "user", "content": transcript}
                ],
                temperature=0.0
            )
            return eval(response.choices[0].message.content)
        except Exception as e:
            print(f"Error analyzing sentiment: {e}")
            return {"error": "Failed to analyze sentiment"}

    def clear_history(self):
        """Clear the conversation history."""
        self.conversation_history = []