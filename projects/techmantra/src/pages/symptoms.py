import streamlit as st
from streamlit_mic_recorder import speech_to_text
import sys
import os

# --- CORE INTEGRATION IMPORTS ---
# Ensures the 'src' directory is in the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from core.ner import extract_entities
    from core.preprocessing import preprocess
    CORE_READY = True
except ImportError as e:
    st.error(f"Core Engine Error: {e}")
    CORE_READY = False

def show():
    # 1. Initialize State
    if "transcript" not in st.session_state:
        st.session_state.transcript = ""
    
    # This matches what results.py looks for
    if "diagnosis" not in st.session_state:
        st.session_state.diagnosis = None

    user_profile = st.session_state.get('user_profile', {})
    user_name = user_profile.get('name', 'Friend')
    
    st.title("🌡️ Symptom Checker")
    st.markdown(f"Hello **{user_name}**, please describe what symptoms you are experiencing.")

    with st.container(border=True):
        st.subheader("Current Distress")
        
        # 2. Voice Input Section
        st.write("🎤 **Record Symptoms:**")
        captured_speech = speech_to_text(
            language='en', 
            start_prompt="Click to Record", 
            stop_prompt="Stop & Transcribe", 
            key='biomistral_mic' 
        )

        if captured_speech and captured_speech != st.session_state.transcript:
            st.session_state.transcript = captured_speech
            st.rerun()

        # 3. Text Area
        user_input = st.text_area(
            "Describe your symptoms in detail:",
            value=st.session_state.transcript,
            height=150,
            placeholder="e.g., I have a sharp pain in my chest and a slight fever..."
        )
        st.session_state.transcript = user_input

        # 4. Vital Triage Data (Optional UI input)
        col1, col2 = st.columns(2)
        with col1:
            ui_severity = st.select_slider(
                "How bad is the pain?",
                options=["Mild", "Moderate", "Severe", "Unbearable"]
            )
        with col2:
            duration = st.selectbox(
                "Duration:",
                ["Just started", "A few hours", "1-2 days", "More than a week"]
            )

    # 5. Action Button & Integration Logic
    if st.button("Analyze with AI", type="primary", use_container_width=True):
        raw_text = st.session_state.transcript.strip()
        
        if not raw_text:
            st.warning("Please provide symptoms to analyze.")
        elif not CORE_READY:
            st.error("Medical Engine is not loaded correctly.")
        else:
            # Basic validation
            has_vowels = any(c in "aeiouAEIOU" for c in raw_text)
            if len(raw_text) < 5 or not has_vowels:
                 st.error("⚠️ Please provide a clearer description of your symptoms.")
            else:
                with st.spinner("BioMistral is analyzing your symptoms..."):
                    # --- STEP 1: Run NER ---
                    ner_results = extract_entities(raw_text)
                    
                    # --- STEP 2: Run Preprocessing ---
                    # Returns payload containing patient context + ner_summary
                    final_payload = preprocess(raw_text, ner_results, user_profile)
                    
                    # --- STEP 3: MOCK/LLM CALL ---
                    # In a full setup, you'd pass final_payload to Ollama here.
                    # We structure the result exactly as results.py expects:
                    st.session_state.diagnosis = {
                        "top_conditions": [
                            {"name": "Common Cold", "probability": 85},
                            {"name": "Influenza", "probability": 45}
                        ],
                        "confidence_score": 0.75,
                        "summary": "The symptoms suggest a viral upper respiratory infection.",
                        "remedies": ["Increase fluid intake", "Rest", "Acetaminophen for fever"],
                        "warnings": ["Monitor for difficulty breathing", "Check for stiff neck"],
                        "sources": ["Mayo Clinic - Viral Infections", "CDC Guidelines 2024"]
                    }
                    
                    # Save context for database
                    st.session_state.current_symptoms = raw_text
                    st.session_state.severity = ner_results['severity'] # 'low' or 'high'
                    
                    st.success("Analysis Complete!")

    # 6. Display Results (Extraction Summary)
    if st.session_state.diagnosis:
        # We use a success-colored box to show we found something
        st.info("✅ **AI has processed your symptoms.** See the summary below before proceeding.")
        
        with st.expander("🔍 View Extraction Details", expanded=True):
            c1, c2, c3 = st.columns(3)
            # Use 'final_payload' data stored in a temp way or re-run logic
            # To keep it simple, we use the results directly
            with c1:
                st.write("**Symptoms**")
                # Pulling from symptoms captured in this run
                ner_res = extract_entities(st.session_state.transcript)
                for s in ner_res['symptoms']:
                    st.markdown(f"- {s}")
            with c2:
                st.write("**Excluded**")
                for n in ner_res['negations']:
                    st.markdown(f"- {n}")
            with c3:
                risk_color = "red" if st.session_state.severity == "high" else "green"
                st.markdown(f"**Tier:** :{risk_color}[{st.session_state.severity.upper()}]")
        
        # NAVIGATION TO NEXT PAGE
        if st.button("Proceed to Full Medical Report ➡️", use_container_width=True):
            st.session_state["current_page"] = "Results" # Tell main.py to show results
            st.rerun()