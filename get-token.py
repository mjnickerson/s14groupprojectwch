import requests

url = "https://studio.edgeimpulse.com/v1/api/NicholasDP-project-1/socket-token"

headers = {
    'accept': "application/json",
    'x-api-key': "PcnMXQRqG49h6kUlzjwdjWUSa0bshtZ8"
    }

response = requests.request("GET", url, headers=headers)

print(response.text)
