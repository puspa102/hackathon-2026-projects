import streamlit as st

def show():
    # Use the name from session state to make it personal
    user_name = st.session_state.user_profile.get('name', 'Patient')
    
    st.title("🌡️ Symptom Checker")
    st.markdown(f"Hello **{user_name}**, please describe what you are experiencing.")

    with st.container(border=True):
        st.subheader("Current Distress")
        
        # 1. The Main Text Description
        user_input = st.text_area(
            "Describe your symptoms in detail:",
            placeholder="e.g. I have a sharp pain in my lower abdomen that started 2 hours ago. I also feel nauseous.",
            height=150
        )

        # 2. Vital Triage Data
        col1, col2 = st.columns(2)
        with col1:
            severity = st.select_slider(
                "Pain Severity",
                options=["Mild", "Moderate", "Severe", "Unbearable"]
            )
        with col2:
            duration = st.selectbox(
                "How long has this been happening?",
                ["Just started", "A few hours", "1-2 days", "More than a week"]
            )

    # 3. Action Button
    if st.button("Analyze with AI", type="primary", use_container_width=True):
        if not user_input.strip():
            st.warning("Please describe your symptoms before analyzing.")
        else:
            # Store symptoms in session state so the AI can read them
            st.session_state.current_symptoms = user_input
            st.success("Analyzing your symptoms...")
            # This is where the AI code will eventually go!