import React from 'react';
import axios from 'axios'
import {MContext} from "./index";

const PROJECT_API_URL = 'http://localhost:8080/api/dm/project';
const LABEL_LINKS_API_URL = 'http://localhost:8080/api/label_links?project=1&expand=label';
const ANNOTATED_TASKS_API_URL = 'http://localhost:8080/api/tasks?view=2';
const TASK_API_PREFIX_URL = 'http://localhost:8080/api/tasks/';

const NOT_AVAILABLE = "(请稍等)"

let token = ""
export function convertUnicode(input) {
    return input.replace(/\\+u([0-9a-fA-F]{4})/g, (a,b) =>
        String.fromCharCode(parseInt(b, 16)));
}

class SongLabels extends React.Component {
    AnnotatedSong = (annotatedLabel, annotationsCount) => {
        return {annotatedLabel: annotatedLabel, annotationsCount: annotationsCount}
    }
    annotatedSongs = [this.AnnotatedSong];
    //构造函数
    constructor() {
        super();
        //react定义数据
        this.state = {
            total_tasks_count:0,
            annotated_tasks_count:0,
            basic_labels:[],
            song_labels:[],
            selected_labels:"",
            query_result_song_names:"(请改变过滤条件)"
        }
    }
    //请求接口的方法
    async fetchData(url) {
        return axios.get(url, {
            headers: {
                'Authorization': `token ${token}`
            }
        }).then(res => res.data)
    }
    async getAnnotatedTasks() {
        let taskIds = []
        let resp = await this.fetchData(ANNOTATED_TASKS_API_URL);
        resp.tasks.forEach((task,taskKey)=>{
            taskIds[taskKey] = task.id
        })
        return taskIds
    }
    async getTasks(taskIds) {
        let songNames = ""
        for (let taskIdsKey in taskIds) {
            let selectedLabels = this.state.selected_labels
            console.log("selectedLabels1:'" + selectedLabels + "'")
            let resp = await this.fetchData(TASK_API_PREFIX_URL + taskIds[taskIdsKey]);
            let annotations = convertUnicode(resp.annotations_results)
            console.log("task '" + taskIds[taskIdsKey] + "/" + resp.data.text + "', query_result_song_names:'" + this.state.query_result_song_names + "', annotations_results:" + annotations)
            this.state.selected_labels.split(',').forEach((label) => {
                if (label.trim() !== "" && annotations.includes(", " + label)) { //simplified logic
                    console.log("Found label '" + label + "' in task '" + taskIds[taskIdsKey] + "/" + resp.data.text + "'.")
                    selectedLabels = selectedLabels.replace(label + ",", "")
                    console.log("selectedLabels2:'" + selectedLabels + "'")
                }
            })
            console.log("selectedLabels3:'" + selectedLabels + "'")
            if (selectedLabels === "") {
                songNames += resp.data.text + ","
            }
        }
        return songNames
    }

    getBasicLabels=()=>{
        console.log("getting basic labels")

        axios.get(PROJECT_API_URL, {
            headers: {
                'Authorization': `token ${token}`
            }
        })
        .then((response) =>{
            console.log(response.data.parsed_label_config.taxonomy.labels);
            //用到this需要注意指向，箭头函数
            this.setState({
                total_tasks_count:response.data.task_count,
                annotated_tasks_count:response.data.annotation_count, //may not accurate, will be overridden by 'total' from ANNOTATED_TASKS_API_URL
                basic_labels:response.data.parsed_label_config.taxonomy.labels,
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    getSongLabels=()=>{
        console.log("getting song labels")

        axios.get(LABEL_LINKS_API_URL, {
            headers: {
                'Authorization': `token ${token}`
            }
        })
        .then((response) =>{
            //用到this需要注意指向，箭头函数
            this.setState({
                song_labels:response.data.results
            })
        })
        .catch(function (error) {
            console.log(error);
        });
    }
    async queryByLabels() {
        console.log("queryByLabels")
        let songNames = NOT_AVAILABLE

        function findZeroAnnotatedSong(annotatedSongs, selectedLabels) {
            let labelWithZeroAnnotations = ""
            for (let annotatedSongsKey in annotatedSongs) {
                selectedLabels.split(',').forEach((label) => {
                    if (annotatedSongs[annotatedSongsKey].annotatedLabel === label &&
                        annotatedSongs[annotatedSongsKey].annotationsCount === 0) {
                        console.log("Found selected label with 0 annotations count:" + label)
                        labelWithZeroAnnotations = label
                    }
                })
                if (labelWithZeroAnnotations !== "") {
                    break
                }
            }
            return labelWithZeroAnnotations;
        }

        let zeroAnnotatedSong = findZeroAnnotatedSong(this.annotatedSongs, this.state.selected_labels);
        console.log("zeroAnnotatedSong:" + zeroAnnotatedSong)
        if (zeroAnnotatedSong === "") {
            if (this.state.selected_labels.trim().length > 0) {
                this.getAnnotatedTasks().then((res) => {
                    console.log("tasks count:" + res.length)
                    this.getTasks(res).then((resp) => {
                        console.log("resp:'" + resp + "'")
                        this.setState({
                            query_result_song_names: resp
                        })
                        // this.state.query_result_song_names = resp
                    })
                    console.log("getTasks done")
                })
            } else {
                songNames = "(0 words selected.)"
            }
        } else {
            songNames = "(selected label '" + zeroAnnotatedSong + "' has not been labeled by any Hymn.)"
        }
        this.state.query_result_song_names = songNames
    };

    change=(event)=> {
        let labelArray = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected labels changed:" + labelArray)
        let labels = ""
        for (let i = 0; i < labelArray.length; i++) {
            labels += labelArray[i] + ","
        }
        this.state.selected_labels = labels
        this.queryByLabels().then()
    }
    componentDidMount() {
        token = this.props.token
        this.getBasicLabels()
        this.getSongLabels()
    }
    render() {
        console.log("rendering SongLabels")
        let i = 0
        return (
            <div>
                <div>
                <select name="keyLabels" multiple size={this.state.basic_labels.length + this.state.song_labels.length} onChange={this.change}>
                    {
                        this.state.basic_labels.map((value,key)=>{
                            return<optgroup key={key} id={key} label={value}>
                                    {
                                        this.state.song_labels.map((songName,songNameKey)=>{
                                            if (value === songName.label.value[0]) {
                                                this.annotatedSongs[i++] = this.AnnotatedSong(songName.label.value[1], songName.annotations_count)
                                                return<option key={songNameKey} value={songName.label.value[1]}>{songName.label.value[1]}/{songName.annotations_count}</option>
                                            } else {
                                                return ""
                                            }
                                        })
                                    }
                                </optgroup>
                        })
                    }
                </select>
                </div>
                <div>诗歌总数：{this.state.total_tasks_count}<br/>已打标签诗歌：{this.state.annotated_tasks_count}</div>
                <div>
                    <MContext.Consumer>
                        {(context) => (
                            <button onClick={()=>{
                                context.setMessage(this.state.query_result_song_names)
                            }}>查 询</button>
                        )}
                    </MContext.Consumer>
                </div>
            </div>
        )
    }
}

export default SongLabels;
