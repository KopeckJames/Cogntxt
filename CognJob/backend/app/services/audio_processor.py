import io
import wave
import tempfile
import os
from typing import Optional
import whisper
import torch
from pydantic import BaseModel

class AudioConfig(BaseModel):
    sample_rate: int = 16000
    channels: int = 1
    sample_width: int = 2
    model_type: str = "base"
    language: str = "en"

class AudioProcessor:
    def __init__(self, config: Optional[AudioConfig] = None):
        self.config = config or AudioConfig()
        self.model = self._load_model()
        print(f"Using GPU for audio processing: {torch.cuda.is_available()}")

    def _load_model(self) -> whisper.Whisper:
        """Load the Whisper model."""
        return whisper.load_model(self.config.model_type)

    async def process_audio(self, audio_data: bytes) -> Optional[str]:
        """Process audio data and return transcription."""
        try:
            # Create temporary WAV file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_file:
                temp_path = temp_file.name
                
                # Write audio data to WAV file
                with wave.open(temp_path, "wb") as wav_file:
                    wav_file.setnchannels(self.config.channels)
                    wav_file.setsampwidth(self.config.sample_width)
                    wav_file.setframerate(self.config.sample_rate)
                    wav_file.writeframes(audio_data)

            # Transcribe audio
            result = self.model.transcribe(
                temp_path,
                language=self.config.language,
                fp16=torch.cuda.is_available()
            )
            
            return result["text"].strip()

        except Exception as e:
            print(f"Error processing audio: {e}")
            return None
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    async def validate_audio(self, audio_data: bytes) -> bool:
        """Validate audio data format and quality."""
        try:
            with io.BytesIO(audio_data) as bio:
                with wave.open(bio, 'rb') as wav:
                    if wav.getnchannels() != self.config.channels:
                        return False
                    if wav.getsampwidth() != self.config.sample_width:
                        return False
                    if wav.getframerate() != self.config.sample_rate:
                        return False
            return True
        except Exception:
            return False