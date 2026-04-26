import streamlit as st
import os
import sys

# --- 1. PAGE CONFIG (Must be the very first command) ---
st.set_page_config(page_title="CareDevi", layout="wide", initial_sidebar_state="expanded")

# --- 2. HIDE DEFAULT NAVIGATION (The CSS Fix) ---
st.markdown("""
    <style>
        [data-testid="stSidebarNav"] { display: none !important; }
        [data-testid="stSidebarContent"] { padding-top: 2rem; }
    </style>
""", unsafe_allow_html=True)

# Path Setup
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.session_state import init_session
from pages import signup, symptoms, doctor_dashboard, results
from db.db import init_db

AUTH_MODE_KEY = "auth_mode_choice"
CURRENT_PAGE_KEY = "current_page"
LOGIN_OPTION = "Login (Returning Patient)"

# Initialize everything
init_session()
init_db()

if not st.session_state.get("is_authenticated"):
    signup.show() 
else:
    st.sidebar.title("🏥 CareDevi")
    user_profile = st.session_state.get("user_profile", {})
    user_name = user_profile.get("name", "User")
    
    if isinstance(user_name, list) and len(user_name) > 0:
        user_name = user_name[0].get("text", "User")
    
    st.sidebar.success(f"✅ Active: {user_name}")
    
    # --- FIXED NAVIGATION LIST ---
    pages = ["Dashboard", "Symptom Checker", "Doctor Dashboard", "Results", "Logout"]
    
    current_pg = st.session_state.get(CURRENT_PAGE_KEY, "Dashboard")
    try:
        default_idx = pages.index(current_pg)
    except ValueError:
        default_idx = 0
    
    nav = st.sidebar.radio("Navigation Menu", pages, index=default_idx)
    
    # --- FIXED PAGE ROUTING ---
    if nav == "Dashboard":
        st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
        signup.show()
    elif nav == "Symptom Checker":
        st.session_state[CURRENT_PAGE_KEY] = "Symptom Checker"
        symptoms.show()
    elif nav == "Doctor Dashboard":
        st.session_state[CURRENT_PAGE_KEY] = "Doctor Dashboard"
        doctor_dashboard.show()
    elif nav == "Results":
        st.session_state[CURRENT_PAGE_KEY] = "Results"
        results.show() # Directly call the module function
    elif nav == "Logout":
        st.session_state.is_authenticated = False
        st.session_state[CURRENT_PAGE_KEY] = "Dashboard"
        st.rerun()