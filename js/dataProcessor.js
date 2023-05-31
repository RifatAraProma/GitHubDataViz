import load_file_update_summary from './donut_chart' 

function load_commit() {
    d3.csv("data/commit_details.csv", (row, i) => {
        return {
            message: row.message,
            created: row.created * 1000, // millisecond
            files_updated: row.files_updated,
            diff: row.diff,
            author: row.author
        };
    }).then(rows => {
        commits = rows;
        let file_list = [];
        let file_update_count = {};
        let file_update_for_bugfix_map = {};
        commits.forEach((commit) => {
            let files = commit.files_updated.replace("[", "").replace("]", "").replaceAll("'", "").split(',');
            let files_diff = getFilesDiffList(commit.diff);
            files.forEach(file => {
                let fileName = file.trim();
                if (fileName.includes("Compositor.cpp"))
                {
                    console.log("here");
                }

                if (!file_list.find(file => file == fileName)) {
                    file_list.push(fileName);
                }
                if (commit.message.includes("fix") && file_update_for_bugfix_map[fileName] == undefined){
                    file_update_for_bugfix_map[fileName] = true;
                }
                files_diff.forEach(file_diff => {
                    if (file_update_count[fileName] == undefined) {
                        file_update_count[fileName] = 0;
                    }
                    if (file_diff.name == fileName) {
                        file_update_count[fileName] += file_diff.added_lines.length + file_diff.deleted_lines.length;
                    }
                });
            });
        });

        //initialize filter modal
        initializeOptionModal();

        var dropDownForFilesBeingDisplayed = document.getElementById("displayedFilesList");
        var dropDownForOtherFiles = document.getElementById("otherFilesList");
        document.getElementById("displayedFilesListHeader").innerHTML = "Top 5 files with most updates";
        document.getElementById("otherFilesListHeader").innerHTML = "Other files";
        file_list.forEach(file => {
            file_update_freq.push({ name: file, update_freq: file_update_count[file], bugfix: file_update_for_bugfix_map[file] });
        });

        file_update_freq.sort((a, b) => (a.update_freq > b.update_freq) ? -1 : 1);

        var option = document.createElement("option");
        option.value = -1; // setting index of the entry as value to access it easy later on
        option.text = "Select All";
        option.id = "selectAllOtherFiles"
        dropDownForOtherFiles.appendChild(option);

        option = document.createElement("option");
        option.value = -1; // setting index of the entry as value to access it easy later on
        option.text = "Select All";
        option.id = "selectAllDisplayedUpdates"
        dropDownForFilesBeingDisplayed.appendChild(option);

        let top_five = [];
        let i = 0;
        file_update_freq.forEach(entry => {
            option = document.createElement("option");
            option.value = i; // setting index of the entry as value to access it easy later on
            option.text = entry.name;

            if (top_five.length != 5) {
                top_five.push(i);
                dropDownForFilesBeingDisplayed.appendChild(option);
            }
            else {
                dropDownForOtherFiles.appendChild(option);
            }

            i++;
        });

        $("#displayedFilesList").val(top_five);

        let freqCounter = 0;
        console.log(file_update_freq);
        file_update_freq.forEach((file) => {
            if(file.update_freq == undefined){
                file.update_freq = 0;
            }
            if (data_to_show.length < 5) {
                data_to_show.push(file);
            }
            else {
                freqCounter += file.update_freq;
            }
        });

        data_to_show.push({ name: "other", update_freq: freqCounter, bugfix: false });
        //show top 5 most updated files
        file_update = load_file_update_summary("#file_update", data_to_show, "number of lines");
        histogram = load_histogram("#histogram", file_update_freq)

        d3.csv("data/issue_details.csv", (row, i) => {
            return {
                title: row.title,
                created: row.created * 1000, // millisec
                closed: row.closed * 1000,
                label: row.label
            };
        }).then(rows => {
            data = rows;

            let title_vis1 = "Issues with their creation and closing dates";
            let x_title_vis1 = "Date";
            timeline = load_timeline("#timeline", data, title_vis1, "created", "closed", "title", x_title_vis1);
        }).catch(error => {
            console.log(error);
        });

    }).catch(error => {
        console.log(error);
    });
}

function initializeOptionModal() {
    // Get the modal
    var modal = document.getElementById("optionsModal");

    // Get the button that opens the modal
    var btn = document.getElementById("optionsBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}