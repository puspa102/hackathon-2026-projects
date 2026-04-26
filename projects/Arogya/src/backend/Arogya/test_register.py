
import requests

url = "http://localhost:8000/accounts/register/"
data = {
    "username": "testuser@example.com",
    "email": "testuser@example.com",
    "password": "password123",
    "first_name": "Test User",
    "role": "patient"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
