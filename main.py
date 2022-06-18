from cProfile import label
from difflib import unified_diff
import requests
import csv
import datetime
from datetime import timezone
from unidiff import PatchSet
import urllib.request


def convert_date_to_utc(date_time_str):
    date_time_obj = datetime.datetime.strptime(
        date_time_str, '%Y-%m-%dT%H:%M:%SZ')
    timestamp = date_time_obj.replace(tzinfo=timezone.utc).timestamp()

    return timestamp


def write_issue_to_csv(issue_list):
    csvWriter = open('issue_details.csv', 'w', newline='')
    writer = csv.writer(csvWriter)
    writer.writerow(
        ["title", "created", "closed", "label"])

    for issue in issue_list:
        createdTimeUTC = convert_date_to_utc(issue.created_date)
        closedTimeUTC = convert_date_to_utc(issue.closed_date)
        createdTime = issue.created_date
        closedTime = issue.closed_date
        label = issue.label
        writer.writerow([issue.title, createdTimeUTC,
                        closedTimeUTC, createdTime, closedTime, label])

    csvWriter.close()


class Issue:
    def __init__(self, _title, _created_date, _closed_date, _label):
        self.title = _title
        self.created_date = _created_date
        self.closed_date = _closed_date
        self.label = _label


def get_issues(url):
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("Error occurred while fetching issues")
        print(response.reason)
        return

    issue_list = []

    issue_json_list = response.json()

    for i in issue_json_list:
        label = 'other'
        for l in i['labels']:
            label_obj = l
            if "bug" in  label_obj['name']:
                label = "bug"
        if (label == "other" and ("fix" in i['title'] or "bug" in i[title])):
            label = "bug"
            
        title = i['title']
        created_date = i['created_at']
        closed_date = i['closed_at']
        
        issue = Issue(title, created_date, closed_date, label)
        issue_list.append(issue)

    return issue_list


def write_commit_to_csv(commit_list):
    csvWriter = open('commit_details.csv', 'w', newline='')
    writer = csv.writer(csvWriter)
    writer.writerow(["Commit Message", "Created Date (UTC Timestamp)", "Files Updated", "Diff", "Author"])
    for commit in commit_list:
        createdTimeUTC = convert_date_to_utc(commit.date)
        writer.writerow([commit.msg, createdTimeUTC, commit.filesChanged, commit.diff, commit.author])

    csvWriter.close()


class Commit:
    def __init__(self, _msg, _date, _filesChanged, _diff, _author):
        self.msg = _msg
        self.date = _date
        self.filesChanged = _filesChanged
        self.diff = _diff
        self.author = _author


def get_updated_files_by_commit(url):
    ref = url.split('/')
    files = []
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("error occurred while fetching commit with ref: " +
              ref[len(ref) - 1])
        print(response.reason)
        return files

    commit_details_json = response.json()

    files_json = commit_details_json["files"]

    for i in files_json:
        files.append(i["filename"])

    return files


def get_diff_by_commit(url):
    ref = url.split('/')
    files = []

    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("error occurred while fetching commit with ref: " + ref[len(ref) - 1])
        print(response.reason)
        return files
    commit_pull_json = response.json()
    if (len(commit_pull_json) == 0):
        return
    diff_url = commit_pull_json[0]["diff_url"]

    diff = urllib.request.urlopen(diff_url)
    encoding = diff.headers.get_charsets()[0]

    patch_set= PatchSet(diff, encoding=encoding)

    change_list=[]  # list of changes
                    # [(file_name, [row_number_of_deleted_line],
                    # [row_number_of_added_lines]), ... ]

    for patched_file in patch_set:
        file_path=patched_file.path  # file name
        #print('file name :' + file_path)
        del_line_no=[line.target_line_no
                    for hunk in patched_file for line in hunk 
                    if line.is_added and
                    line.value.strip() != '']  # the row number of deleted lines
        #print('deleted lines : ' + str(del_line_no))
        ad_line_no = [line.source_line_no for hunk in patched_file 
                    for line in hunk if line.is_removed and
                    line.value.strip() != '']   # the row number of added liens
        #print('added lines : ' + str(ad_line_no))
        change_list.append((file_path, del_line_no, ad_line_no))

    return change_list


def get_commits(url):
    response = requests.get(url)
    response_code = response.status_code

    if response_code != 200:
        print("Error occurred while fetching commits")
        print(response.reason)
        return

    commit_list = []
    commit_json_list = response.json()
   
    for i in range(20,26):
        ref = commit_json_list[i]["sha"]
        filesUpdated = get_updated_files_by_commit(url + "/" + ref)
        diff = get_diff_by_commit(url + "/" + ref + "/pulls")
        commit_json = commit_json_list[i]["commit"]
        msg = commit_json["message"]
        date = commit_json["committer"]["date"]
        author = commit_json["author"]["name"]
        commit = Commit(msg, date, filesUpdated, diff, author)
        commit_list.append(commit)
        # print(msg)
        # print(i)
        # print("\n")

    return commit_list


# There is a limit on requests. you can't send more than 100 requests per repo per hour

# list_of_issues = get_issues("https://api.github.com/repos/freeCodeCamp/freeCodeCamp/issues?state=closed")
# write_issue_to_csv(list_of_issues)

# list_of_commits = get_commits("https://api.github.com/repos/freeCodeCamp/freeCodeCamp/commits")
# print(list_of_commits)
# write_commit_to_csv(list_of_commits)

list_of_issues = get_issues("https://api.github.com/repos/vaxerski/Hyprland/issues?state=closed")
write_issue_to_csv(list_of_issues)

# list_of_commits = get_commits("https://api.github.com/repos/vaxerski/Hyprland/commits")
# write_commit_to_csv(list_of_commits)

# list_of_issues = get_issues("https://api.github.com/repos/vaxerski/Hyprland/commits")
# write_issue_to_csv(list_of_issues)
