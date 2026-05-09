import os
import json
import speech_recognition as sr
from gtts import gTTS
import google.generativeai as genai
from googletrans import Translator
from flask import Blueprint, request, jsonify, send_file

ai_blueprint = Blueprint('ai', __name__)

# Configure Gemini API
# Please set this inside your environment or replace with actual key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

translator = Translator()

def generate_voice(text, lang='en'):
    """Generates a TTS audio file and returns its path"""
    # Mapping our internal languages to gTTS language codes
    lang_map = {
        'English': 'en',
        'Hindi': 'hi',
        'Odia': 'or', # Note: gTTS support for odia might be limited, fallback to Hindi or English if fails
        'Bengali': 'bn',
        'Telugu': 'te'
    }
    gtts_lang = lang_map.get(lang, 'en')
    
    try:
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        output_path = os.path.join(os.path.dirname(__file__), "response.mp3")
        tts.save(output_path)
        return output_path
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

@ai_blueprint.route('/api/chat', methods=['POST'])
def chat():
    """
    Handles standard text chat, language translation, and Gemini response.
    """
    data = request.get_json()
    message = data.get('message', '')
    language = data.get('language', 'English')
    student_context = data.get('student_context', {})
    
    if not message:
        return jsonify({"error": "Message is required"}), 400

    # Translate target language to english for Gemini (if non-english)
    # This ensures high-quality AI processing
    english_query = message
    if language != 'English':
        try:
            translation = translator.translate(message, dest='en')
            english_query = translation.text
        except Exception as e:
            print(f"Translation Error: {e}")
            
    # System Instruction Context
    prompt = f"""
    You are 'Nexus', an advanced AI Academic Assistant for NIST University.
    You must provide short, concise, and professional answers.
    
    Student Context:
    Name: {student_context.get('name', 'Student')}
    Roll No: {student_context.get('rollNo', 'Unknown')}
    Reg No: {student_context.get('regNo', 'Unknown')}
    
    User Query: {english_query}
    """
    
    try:
        response = model.generate_content(prompt)
        ai_reply = response.text
        
        # Translate back to requested language
        if language != 'English':
            reply_translation = translator.translate(ai_reply, dest=language.lower()[:2])
            ai_reply = reply_translation.text

        return jsonify({
            "status": "success",
            "reply": ai_reply
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ai_blueprint.route('/api/voice/process', methods=['POST'])
def process_voice():
    """
    Optional: Process server-side audio file if STT is not done in the browser.
    In our React App, we do STT in the browser using Web Speech API, which is much faster.
    This route demonstrates server-side SpeechRecognition capability.
    """
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
        
    audio_file = request.files['audio']
    language = request.form.get('language', 'en-IN')
    
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language=language)
            return jsonify({'text': text})
    except sr.UnknownValueError:
        return jsonify({'error': 'Could not understand audio'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ai_blueprint.route('/api/voice/synthesize', methods=['POST'])
def synthesize_voice():
    """
    Converts text to speech and returns the audio file.
    """
    data = request.get_json()
    text = data.get('text', '')
    language = data.get('language', 'English')
    
    audio_path = generate_voice(text, language)
    if audio_path and os.path.exists(audio_path):
        return send_file(audio_path, mimetype="audio/mpeg", as_attachment=False)
    
    return jsonify({"error": "Failed to generate audio"}), 500
