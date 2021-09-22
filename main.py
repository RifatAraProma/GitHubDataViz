import requests
import csv
import datetime
from datetime import timezone


def convert_date_to_utc(date_time_str):
    date_time_obj = datetime.datetime.strptime(date_time_str, '%Y-%m-%dT%H:%M:%SZ')
    timestamp = date_time_obj.replace(tzinfo=timezone.utc).timestamp()

    return timestamp


def write_issue_to_csv(issue_list):
    csvWriter = open('issue_details.csv', 'w', newline='')
    writer = csv.writer(csvWriter)
    writer.writerow(["Issue Title", "Created Date (UTC Timestamp)", "Closed Date (UTC Timestamp)"])

    for issue in issue_list:
        createdTimeUTC = convert_date_to_utc(issue.created_date)
        closedTimeUTC = convert_date_to_utc(issue.closed_date)
        writer.writerow([issue.title, createdTimeUTC, closedTimeUTC])

    csvWriter.close()


class Issue:
    def __init__(self, _title, _created_date, _closed_date):
        self.title = _title
        self.created_date = _created_date
        self.closed_date = _closed_date


def get_issues(url):
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("Error occurred while fetching issues")
        return

    issue_list = []

    issue_json_list = response.json();

    for i in issue_json_list:
        title = i['title']
        created_date = i['created_at']
        closed_date = i['closed_at']
        issue = Issue(title, created_date, closed_date)
        issue_list.append(issue)

    return issue_list


def write_commit_to_csv(commit_list):
    csvWriter = open('commit_details.csv', 'w', newline='')
    writer = csv.writer(csvWriter)
    writer.writerow(["Commit Message", "Created Date (UTC Timestamp)", "Files Updated"])

    for commit in commit_list:
        createdTimeUTC = convert_date_to_utc(commit.date)
        writer.writerow([commit.msg, createdTimeUTC, commit.filesChanged])

    csvWriter.close()


class Commit:
    def __init__(self, _msg, _date, _filesChanged):
        self.msg = _msg
        self.date = _date
        self.filesChanged = _filesChanged


def get_updated_files_by_commit(url):
    ref = url.split('/')
    files = []
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("error occurred while fetching commit with ref: " + ref[len(ref) - 1])
        return files

    commit_details_json = response.json()

    files_json = commit_details_json["files"]

    for i in files_json:
        files.append(i["filename"])

    return files


def get_commits(url):
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("Error occurred while fetching commits")
        return

    commit_list = []
    commit_json_list = response.json()

    for i in commit_json_list:
        ref = i["sha"]
        filesUpdated = get_updated_files_by_commit(url + "/" + ref)
        commit_json = i["commit"]
        msg = commit_json["message"]
        date = commit_json["committer"]["date"]
        commit = Commit(msg, date, filesUpdated)
        commit_list.append(commit)

    return commit_list

##There is a limit on requests. you can't send more than 100 requests per repo per hour

# list_of_issues = get_issues("https://api.github.com/repos/freeCodeCamp/freeCodeCamp/issues?state=closed")
# write_issue_to_csv(list_of_issues)
#
# list_of_commits = get_commits("https://api.github.com/repos/freeCodeCamp/freeCodeCamp/commits")
# write_commit_to_csv(list_of_commits)
