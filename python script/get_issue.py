import requests
from cProfile import label
from difflib import unified_diff
import requests
import csv
import datetime
from datetime import timezone
from unidiff import PatchSet
import urllib.request
import pandas as pd



def convert_date_to_utc(date_time_str):
    if date_time_str == None:
        return datetime.datetime.utcnow()
    
    date_time_obj = datetime.datetime.strptime(
        date_time_str, '%Y-%m-%dT%H:%M:%SZ')
    timestamp = date_time_obj.replace(tzinfo=timezone.utc).timestamp()

    return timestamp


def write_json_to_csv(json_list, filename):
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=json_list[0].keys())
        writer.writeheader()
        for obj in json_list:
            writer.writerow(obj)

# Replace with your GitHub repository details
owner = 'freeCodeCamp'
repo = 'freeCodeCamp'

# Set the API endpoint
url = f'https://api.github.com/repos/{owner}/{repo}/issues'

# Define query parameters to fetch latest 20 issues
params = {
    'type': 'issue',
    'state': 'all',  # Fetch issues in all states (open, closed, etc.)
    'per_page': 100,  # Number of issues per page
    'sort': 'created',  # Sort by created date
    'direction': 'desc'  # Sort in descending order
}

# Send GET request to GitHub API
response1 = requests.get(url, params=params)
response2 = requests.get(url, params=params)

# Check if response is successful (HTTP status code 200)
if response1.status_code == 200 and response2.status_code == 200:
    # Extract the JSON response
    issues = response1.json() + response2.json()
    csvWriter = open('issue_details.csv', 'w', newline='')
    writer = csv.writer(csvWriter)
    writer.writerow(
        ["issue_id", "issue_number", "title", "state",  "created", "closed", "labels"])

    # Loop through the issues and print relevant information
    for issue in issues:
        if('pull_request' in issue):
            continue
        createdTime = convert_date_to_utc(issue['created_at'])
        closedTime = convert_date_to_utc(issue['closed_at'])
        labels = issue['labels']
        writer.writerow([issue['id'], issue['number'], issue['title'], issue['state'], createdTime, closedTime, labels])


    csvWriter.close()

else:
    # Print an error message if request fails
    print(f"Failed to fetch issues. HTTP status code: {response.status_code}")
