#!/usr/bin/env python
"""
Quick login test script for Arogya authentication
"""

import json

import requests

API_BASE_URL = "http://localhost:8000"


def test_login(username, password):
    """Test login with given credentials"""
    print(f"\n{'=' * 60}")
    print(f"Testing login for: {username}")
    print(f"{'=' * 60}")

    url = f"{API_BASE_URL}/accounts/login/"
    payload = {"username": username, "password": password}

    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload, timeout=10)

        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")

        if response.status_code == 200:
            data = response.json()
            print(f"\n✓ Login successful!")
            print(f"Token: {data.get('token', 'N/A')[:30]}...")
            print(f"User: {data.get('user', {})}")
            return True
        else:
            print(f"\n✗ Login failed!")
            try:
                error_data = response.json()
                print(f"Error data: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
            return False

    except Exception as e:
        print(f"\n✗ Exception occurred: {e}")
        return False


def test_registration(username, email, password, role="patient"):
    """Test registration"""
    print(f"\n{'=' * 60}")
    print(f"Testing registration for: {username}")
    print(f"{'=' * 60}")

    url = f"{API_BASE_URL}/accounts/register/"
    payload = {
        "username": username,
        "email": email,
        "password": password,
        "first_name": "Test User",
        "role": role,
    }

    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")

    try:
        response = requests.post(url, json=payload, timeout=10)

        print(f"\nStatus Code: {response.status_code}")

        if response.status_code == 201:
            data = response.json()
            print(f"\n✓ Registration successful!")
            print(f"Token: {data.get('token', 'N/A')[:30]}...")
            print(f"User: {data.get('user', {})}")
            return True
        else:
            print(f"\n✗ Registration failed!")
            try:
                error_data = response.json()
                print(f"Error data: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
            return False

    except Exception as e:
        print(f"\n✗ Exception occurred: {e}")
        return False


if __name__ == "__main__":
    print("AROGYA AUTHENTICATION TEST")
    print("=" * 60)

    # Test with existing users
    print("\n[TEST 1] Login with patient@test.com")
    test_login("patient@test.com", "test123")

    print("\n[TEST 2] Login with doctor@test.com")
    test_login("doctor@test.com", "test123")

    print("\n[TEST 3] Login with wrong password")
    test_login("patient@test.com", "wrongpassword")

    print("\n[TEST 4] Login with non-existent user")
    test_login("nonexistent@test.com", "test123")

    # Test new registration
    import random

    random_id = random.randint(1000, 9999)
    print(f"\n[TEST 5] Register new user")
    if test_registration(
        f"newuser{random_id}@test.com",
        f"newuser{random_id}@test.com",
        "test123",
        "patient",
    ):
        print(f"\n[TEST 6] Login with newly registered user")
        test_login(f"newuser{random_id}@test.com", "test123")

    print("\n" + "=" * 60)
    print("TESTS COMPLETED")
    print("=" * 60)
