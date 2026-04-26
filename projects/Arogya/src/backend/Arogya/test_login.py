
import requests

url = "http://localhost:8000/accounts/login/"
data = {
    "username": "testuser@example.com",
    "password": "password123"
}

response = requests.post(url, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
