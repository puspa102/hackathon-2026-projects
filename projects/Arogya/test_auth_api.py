#!/usr/bin/env python
"""
Arogya Authentication API Test Script

This script tests the authentication endpoints to verify proper setup.
Run this script after completing migrations to ensure everything works.

Usage:
    python test_auth_api.py
"""

import json
import random
import string
import sys
from typing import Dict, Optional

try:
    import requests
except ImportError:
    print("Error: 'requests' library not found.")
    print("Install it with: pip install requests")
    sys.exit(1)


class Colors:
    """ANSI color codes for terminal output"""

    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    BOLD = "\033[1m"
    END = "\033[0m"


def print_success(message: str):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")


def print_error(message: str):
    print(f"{Colors.RED}✗ {message}{Colors.END}")


def print_info(message: str):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")


def print_header(message: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}")
    print(f"{Colors.BOLD}{message}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.END}\n")


def generate_random_string(length: int = 8) -> str:
    """Generate random string for unique usernames"""
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


class AuthAPITester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url.rstrip("/")
        self.token: Optional[str] = None
        self.user_data: Optional[Dict] = None
        self.test_username = f"test_{generate_random_string()}@example.com"
        self.test_password = "test123456"

    def test_server_connection(self) -> bool:
        """Test if server is reachable"""
        print_info("Testing server connection...")
        try:
            response = requests.get(self.base_url, timeout=5)
            print_success(f"Server is reachable at {self.base_url}")
            return True
        except requests.exceptions.ConnectionError:
            print_error(f"Cannot connect to server at {self.base_url}")
            print_error("Make sure the Django server is running:")
            print_error("  python manage.py runserver")
            return False
        except Exception as e:
            print_error(f"Connection error: {str(e)}")
            return False

    def test_registration_patient(self) -> bool:
        """Test user registration as patient"""
        print_info("Testing patient registration...")

        url = f"{self.base_url}/accounts/register/"
        payload = {
            "username": self.test_username,
            "email": self.test_username,
            "password": self.test_password,
            "first_name": "Test Patient",
            "role": "patient",
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            data = response.json()

            if response.status_code == 201:
                print_success("Patient registration successful!")

                # Verify response contains required fields
                if "token" in data:
                    print_success(f"Token received: {data['token'][:20]}...")
                    self.token = data["token"]
                else:
                    print_error("Token not found in response!")
                    return False

                if "user" in data:
                    self.user_data = data["user"]
                    print_success(f"User ID: {data['user'].get('id')}")
                    print_success(f"Username: {data['user'].get('username')}")
                    print_success(f"Role: {data['user'].get('role')}")
                else:
                    print_error("User data not found in response!")
                    return False

                return True
            else:
                print_error(f"Registration failed with status {response.status_code}")
                print_error(f"Response: {json.dumps(data, indent=2)}")
                return False

        except Exception as e:
            print_error(f"Registration error: {str(e)}")
            return False

    def test_registration_doctor(self) -> bool:
        """Test user registration as doctor"""
        print_info("Testing doctor registration...")

        doctor_username = f"doctor_{generate_random_string()}@example.com"
        url = f"{self.base_url}/accounts/register/"
        payload = {
            "username": doctor_username,
            "email": doctor_username,
            "password": self.test_password,
            "first_name": "Test Doctor",
            "role": "doctor",
        }

        try:
            response = requests.post(url, json=payload, timeout=10)
            data = response.json()

            if response.status_code == 201:
                print_success("Doctor registration successful!")
                if data.get("user", {}).get("role") == "doctor":
                    print_success("Role correctly set to 'doctor'")
                    return True
                else:
                    print_error("Role not set correctly!")
                    return False
            else:
                print_error(f"Doctor registration failed: {response.status_code}")
                return False

        except Exception as e:
            print_error(f"Doctor registration error: {str(e)}")
            return False

    def test_login(self) -> bool:
        """Test user login"""
        print_info("Testing login...")

        url = f"{self.base_url}/accounts/login/"
        payload = {"username": self.test_username, "password": self.test_password}

        try:
            response = requests.post(url, json=payload, timeout=10)
            data = response.json()

            if response.status_code == 200:
                print_success("Login successful!")

                if "token" in data:
                    print_success(f"Token received: {data['token'][:20]}...")
                    login_token = data["token"]

                    # Verify token matches registration token
                    if login_token == self.token:
                        print_success("Token matches registration token (as expected)")
                    else:
                        print_info("Note: Different token received (this is OK)")

                    return True
                else:
                    print_error("Token not found in login response!")
                    return False
            else:
                print_error(f"Login failed with status {response.status_code}")
                print_error(f"Response: {json.dumps(data, indent=2)}")
                return False

        except Exception as e:
            print_error(f"Login error: {str(e)}")
            return False

    def test_login_invalid_credentials(self) -> bool:
        """Test login with invalid credentials"""
        print_info("Testing login with invalid credentials...")

        url = f"{self.base_url}/accounts/login/"
        payload = {"username": self.test_username, "password": "wrong_password"}

        try:
            response = requests.post(url, json=payload, timeout=10)

            if response.status_code == 400:
                print_success("Invalid credentials correctly rejected!")
                return True
            else:
                print_error(f"Expected 400 status, got {response.status_code}")
                return False

        except Exception as e:
            print_error(f"Error testing invalid credentials: {str(e)}")
            return False

    def test_profile_get(self) -> bool:
        """Test getting user profile"""
        print_info("Testing profile retrieval...")

        if not self.token:
            print_error("No token available. Cannot test profile endpoint.")
            return False

        url = f"{self.base_url}/accounts/profile/"
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.get(url, headers=headers, timeout=10)
            data = response.json()

            if response.status_code == 200:
                print_success("Profile retrieved successfully!")
                print_success(f"User: {data.get('username')}")
                print_success(f"Email: {data.get('email')}")
                print_success(f"Role: {data.get('role')}")
                return True
            else:
                print_error(f"Profile retrieval failed: {response.status_code}")
                return False

        except Exception as e:
            print_error(f"Profile retrieval error: {str(e)}")
            return False

    def test_profile_unauthorized(self) -> bool:
        """Test profile access without token"""
        print_info("Testing profile access without authentication...")

        url = f"{self.base_url}/accounts/profile/"

        try:
            response = requests.get(url, timeout=10)

            if response.status_code == 401:
                print_success("Unauthorized access correctly blocked!")
                return True
            else:
                print_error(f"Expected 401 status, got {response.status_code}")
                return False

        except Exception as e:
            print_error(f"Error testing unauthorized access: {str(e)}")
            return False

    def test_logout(self) -> bool:
        """Test user logout"""
        print_info("Testing logout...")

        if not self.token:
            print_error("No token available. Cannot test logout.")
            return False

        url = f"{self.base_url}/accounts/logout/"
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            response = requests.post(url, headers=headers, timeout=10)

            if response.status_code == 200:
                print_success("Logout successful!")
                return True
            else:
                print_error(f"Logout failed: {response.status_code}")
                return False

        except Exception as e:
            print_error(f"Logout error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all authentication tests"""
        print_header("AROGYA AUTHENTICATION API TESTS")

        results = []

        # Test 1: Server connection
        if not self.test_server_connection():
            print_error("\nCannot proceed without server connection!")
            return

        print_header("TEST 1: Patient Registration")
        results.append(("Patient Registration", self.test_registration_patient()))

        print_header("TEST 2: Doctor Registration")
        results.append(("Doctor Registration", self.test_registration_doctor()))

        print_header("TEST 3: Login")
        results.append(("Login", self.test_login()))

        print_header("TEST 4: Invalid Credentials")
        results.append(("Invalid Login", self.test_login_invalid_credentials()))

        print_header("TEST 5: Profile Retrieval")
        results.append(("Profile GET", self.test_profile_get()))

        print_header("TEST 6: Unauthorized Access")
        results.append(("Unauthorized Block", self.test_profile_unauthorized()))

        print_header("TEST 7: Logout")
        results.append(("Logout", self.test_logout()))

        # Print summary
        print_header("TEST SUMMARY")
        passed = sum(1 for _, result in results if result)
        total = len(results)

        for test_name, result in results:
            if result:
                print_success(f"{test_name}")
            else:
                print_error(f"{test_name}")

        print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.END}")

        if passed == total:
            print_success(
                "\n🎉 All tests passed! Authentication system is working correctly!"
            )
            print_info("\nYou can now:")
            print_info("  1. Update the IP address in frontend/services/config.ts")
            print_info("  2. Start the frontend app")
            print_info("  3. Test registration and login from the mobile app")
        else:
            print_error(f"\n⚠️  {total - passed} test(s) failed!")
            print_info("\nTroubleshooting:")
            print_info("  1. Ensure migrations are run: python manage.py migrate")
            print_info("  2. Check that rest_framework.authtoken is in INSTALLED_APPS")
            print_info("  3. Verify the server is running on port 8000")
            print_info("  4. Check server console for error messages")


def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description="Test Arogya authentication endpoints")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL of the API (default: http://localhost:8000)",
    )

    args = parser.parse_args()

    tester = AuthAPITester(base_url=args.url)
    tester.run_all_tests()


if __name__ == "__main__":
    main()
