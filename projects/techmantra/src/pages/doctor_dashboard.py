import streamlit as st
import json
from db.db import get_sessions_for_doctor
from app.session_state import init_session

def show():
    init_session()
    
    # 1. Identity Check
    user_profile = st.session_state.get("user_profile", {})
    doctor_email = user_profile.get("email") 

    if not doctor_email:
        st.error("Please log in with your provider email to access the dashboard.")
        return

    st.title("👨‍⚕️ Provider Dashboard")
    st.markdown(f"Overview for **{doctor_email}**")
    
    if st.button("🔄 Refresh Data"):
        st.rerun()

    # 2. Fetch Data (This uses the email bridge we discussed)
    sessions = get_sessions_for_doctor(doctor_email)
    
    if not sessions:
        st.info("No patient sessions have been assigned to this email address yet.")
        return

    # 3. Metrics Summary
    high_risk = sum(1 for s in sessions if s['risk_tier'] == "HIGH")
    med_risk = sum(1 for s in sessions if s['risk_tier'] == "MEDIUM")
    low_risk = sum(1 for s in sessions if s['risk_tier'] == "LOW")

    m1, m2, m3 = st.columns(3)
    m1.metric("🚨 HIGH RISK", high_risk)
    m2.metric("⚠️ MEDIUM", med_risk)
    m3.metric("✅ LOW", low_risk)
    
    st.divider()

    # 4. Filter
    filter_choice = st.selectbox("Filter by Urgency", ["All", "HIGH", "MEDIUM", "LOW"])
    
    # 5. Display Patients
    for s in sessions:
        if filter_choice != "All" and s['risk_tier'] != filter_choice:
            continue
            
        # Set icon based on risk tier
        icon = "🚨" if s['risk_tier'] == "HIGH" else "⚠️" if s['risk_tier'] == "MEDIUM" else "✅"
        
        # Patient Header
        with st.expander(f"{icon} {s['name']} ({s['age']} {s['sex'][0].upper()}) - {s['risk_tier']} RISK"):
            col1, col2 = st.columns([1, 1])
            
            with col1:
                st.markdown("**📋 Patient Details**")
                st.write(f"**Name:** {s['name']}")
                st.write(f"**Age:** {s['age']}")
                st.write(f"**Sex:** {s['sex']}")
                st.caption(f"Captured on: {s['created_at']}")

            with col2:
                st.markdown("**🩺 Reported Symptoms**")
                # This shows exactly what the patient typed or spoke
                if s['symptoms']:
                    st.info(s['symptoms'])
                else:
                    st.write("No symptom description provided.")

            st.divider()
            
            # Placeholder for future LLM integration
            st.caption("🤖 *AI Analysis (BioMistral) will appear here once connected.*")
            
            # Action Buttons
            c1, c2 = st.columns(2)
            if c1.button("Mark as Reviewed", key=f"rev_{s['session_id']}"):
                st.success(f"Review recorded for {s['name']}")
            if c2.button("Notify Patient", key=f"notif_{s['session_id']}"):
                st.info(f"Notification queued for {doctor_email}")

if __name__ == "__main__":
    show()