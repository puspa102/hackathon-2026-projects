
import requests

url = "http://localhost:8000/accounts/register/"
data = {
    "username": "invalidrole@example.com",
    "email": "invalidrole@example.com",
    "password": "password123",
    "first_name": "Test User",
    "role": "invalid"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
