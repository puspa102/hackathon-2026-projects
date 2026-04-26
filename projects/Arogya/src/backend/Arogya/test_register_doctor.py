
import requests

url = "http://localhost:8000/accounts/register/"
data = {
    "username": "testdoctor@example.com",
    "email": "testdoctor@example.com",
    "password": "password123",
    "first_name": "Test Doctor",
    "role": "doctor"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
