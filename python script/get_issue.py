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
from urllib.parse import urlparse
import json


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

def getPRInfo(pull_request_url):
    pull_request_response = requests.get(pull_request_url)
    info = {}
    if pull_request_response.status_code == 200:
        pull_request_data = pull_request_response.json()
        creator = pull_request_data["user"]["login"]
        info['creator'] = creator
    else:
        info['creator'] = None
        print(f"Error: {pull_request_response.status_code} - {pull_request_response.text}")

    # Get pull request commits
    commits_url = pull_request_data["commits_url"].split("{")[0]
    commits_response = requests.get(commits_url)
    if commits_response.status_code == 200:
        commits_data = commits_response.json()
        commit = []
        for commit in commits_data:
            sha = commit["sha"]
            message = commit["commit"]["message"]
            commit.append({'sha': sha, 'message': message})
            print(f"Commit SHA: {sha}")
            print(f"Commit message: {message}")
        
    else:
        print(f"Error: {commits_response.status_code} - {commits_response.text}")
    info['commits'] = commit

def getPR(issue_number):
    pr_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if "pull_request" in data:
            pull_request_url = data["pull_request"]["url"]
            # Do something with the pull request URL
            print(pull_request_url)
        else:
            # The issue is not associated with a pull request
            print("No pull request associated with the issue.")
    else:
        # Handle the request error
        print(f"Error: {response.status_code} - {response.text}")

def getClosedBy(issue_number):
    closed_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{issue_number}"
    response = requests.get(closed_url)
    closed_by = ""
    if response.status_code == 200:
        data = response.json()
        if data["closed_by"] != None:
            closed_by = data["closed_by"]["login"]
        else:
            closed_by = ''
    else:
        # Handle the request error
        print(f"Error: {response.status_code} - {response.text}")

    return closed_by


# Replace with your GitHub repository details
owner = 'airbnb'
repo = 'javascript'

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
    # Save issues to a file
    with open("issues.json", "w") as file:
        json.dump(issues, file, indent=4)

    csvWriter = open('issue_details.csv', 'w', newline='', encoding='utf-8')
    writer = csv.writer(csvWriter)
    writer.writerow(
        ["issue_id", "issue_number", "title", "state",  "created", "closed", "labels", "user", "assignees", "closed_by"])
    
    pr_list = []

    # Loop through the issues and print relevant information
    for issue in issues:
        if ('pull_request' in issue):
            pr_list.append(issue)
            continue
        
        createdTime = convert_date_to_utc(issue['created_at'])
        closedTime = convert_date_to_utc(issue['closed_at'])
        labels = issue['labels']
        closed_by = ''
        if(issue['state'] == "closed"):
            
            closed_by = getClosedBy(issue['number'])
        

        writer.writerow([issue['id'], issue['number'], issue['title'], issue['state'],
                        createdTime, closedTime, labels, issue['user'], issue['assignee'], closed_by])

    csvWriter.close()

    # Save PR to a file
    with open("pull_requests.json", "w") as file:
        json.dump(pr_list, file, indent=4)


else:
    # Print an error message if request fails
    print(f"Failed to fetch issues. HTTP status code: {response2.status_code}")
