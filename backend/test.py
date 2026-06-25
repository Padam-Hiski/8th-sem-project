# save as test_api.py in backend folder
import requests

url = "http://localhost:5000/predict"
with open("rice.jpeg", "rb") as f:  # put any jpg in backend folder
    response = requests.post(url, files={"image": f})
    print("Status:", response.status_code)
    print("Response:", response.json())