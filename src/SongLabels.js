import React from 'react';
import SongNames from "./SongNames";
import styles from "./SongLabels.module.css";

const PROJECT_API_URL = process.env.REACT_APP_LABEL_STUDIO_DOMAIN + '/api/dm/project';
const LABEL_LINKS_API_URL = process.env.REACT_APP_LABEL_STUDIO_DOMAIN + '/api/label_links?project=1&expand=label';
const TASK_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs?";

const NOT_AVAILABLE = "(请稍等)"
const INVALID_CONDITIONS = "(请修改过滤标签)"
const ZERO_RESULTS = "(无结果)"
const INVALID_BACKEND = "(搜索库故障)"

class SongLabels extends React.Component {
    AnnotatedSong = (annotatedLabel, annotationsCount) => {
        return {annotatedLabel: annotatedLabel, annotationsCount: annotationsCount}
    }
    annotatedSongs = [this.AnnotatedSong];
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            basic_labels_children_count:[],
            basic_labels:[],
            song_labels:[],
            selected_labels:[],
            labels_loaded:false,
            query_result_song_names: ""
        }
    }
    //请求接口的方法
    async fetchData(url) {
        return fetch(url, {
            headers: {
                'Authorization': `token ${this.props.token}`
            },
            method: 'GET'
        })
        .then(response => response.json())
        .catch(function (error) {
            console.log(error);
        });
    }
    async getTasks() {
        let songNames = ""
        let selectedLabelsArray = this.state.selected_labels
        console.log("selectedLabelsArray:'" + selectedLabelsArray + "'")
        if (selectedLabelsArray.length > 0) {
            let selectedLabelsAsQueryString = ""
            for (let index in selectedLabelsArray) {
                selectedLabelsAsQueryString += "label=" + selectedLabelsArray[index] + "&"
            }
            let resp = await this.fetchData(TASK_API_PREFIX_URL + selectedLabelsAsQueryString);
            if (undefined !== resp) {
                for (let i in resp) {
                    console.log("song name:'" + resp[i].nameCn + "'")
                    songNames += resp[i].nameCn + ","
                }
            } else {
                songNames = INVALID_BACKEND
            }
        } else {
            songNames = INVALID_CONDITIONS
        }
        return songNames
    }

    async getBasicLabels() {
        console.log("getting basic labels")

        let resp = await this.fetchData(PROJECT_API_URL);
        console.log(resp.parsed_label_config.taxonomy.labels);
        this.setState({
            basic_labels:resp.parsed_label_config.taxonomy.labels,
        })
    }
    async getSongLabels() {
        console.log("getting song labels")

        let resp = await this.fetchData(LABEL_LINKS_API_URL);
        this.setState({
            song_labels:resp.results
        })
    }
    async queryByLabels() {
        console.log("queryByLabels")
        let songNames = NOT_AVAILABLE

        function findZeroAnnotatedSong(annotatedSongs, selectedLabels) {
            let labelWithZeroAnnotations = ""
            for (let annotatedSongsKey in annotatedSongs) {
                for (let selectedLabelsKey in selectedLabels) {
                    if (annotatedSongs[annotatedSongsKey].annotatedLabel === selectedLabels[selectedLabelsKey] &&
                        annotatedSongs[annotatedSongsKey].annotationsCount === 0) {
                        console.log("Found selected label with 0 annotations count:" + selectedLabels[selectedLabelsKey])
                        labelWithZeroAnnotations = selectedLabels[selectedLabelsKey]
                    }
                }
                if (labelWithZeroAnnotations !== "") {
                    break
                }
            }
            return labelWithZeroAnnotations;
        }

        let zeroAnnotatedSong = findZeroAnnotatedSong(this.annotatedSongs, this.state.selected_labels);
        console.log("zeroAnnotatedSong:'" + zeroAnnotatedSong + "'")
        if (zeroAnnotatedSong.trim().length === 0) {
            if (this.state.selected_labels.length > 0) {
                this.getTasks().then((resp) => {
                    console.log("resp:'" + resp + "'")
                    if (resp.trim().length === 0) {
                        resp = ZERO_RESULTS
                    }
                    this.setState({
                        query_result_song_names: resp
                    })
                })
                console.log("getTasks done")
            } else {
                songNames = "(0 words selected.)"
                this.setState({
                    query_result_song_names: songNames
                })
            }
        } else {
            songNames = "(selected label '" + zeroAnnotatedSong + "' has not been labeled by any Hymn.)"
            this.setState({
                query_result_song_names: songNames
            })
        }
    };
    setBasicLabelsCount() {
        if (!this.state.labels_loaded) {
            console.log("setBasicLabelsCount")
            for (let i = 0; i < this.state.basic_labels.length; i++) {
                let optGroupLabel = document.getElementById("bl" + i).getAttribute("label")
                document.getElementById("bl" + i).setAttribute("label", optGroupLabel + "/" + this.state.basic_labels_children_count[i])
            }
            this.state.labels_loaded = true
        }
    }

    change=(event)=> {
        let labelArray = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected labels changed:" + labelArray)
        this.state.selected_labels = labelArray
        this.queryByLabels().then()
    }
    componentDidMount() {
        this.getBasicLabels().then()
        this.getSongLabels().then()
    }
    render() {
        console.log("rendering SongLabels")
        let i = 0
        let basicLabelsChildrenCount = 0;
        return (
            <div>
                <table className={styles.tbl}>
                    <tbody>
                    <tr>
                        <td className={styles.tdLabels}>
                            <select name="keyLabels" multiple size={this.state.basic_labels.length + this.state.song_labels.length} onChange={this.change}>
                                {
                                    this.state.basic_labels.map((value,key)=>{
                                        basicLabelsChildrenCount = 0
                                        let result = <optgroup key={key} id={"bl" + key} label={value}>
                                            {
                                                this.state.song_labels.map((songName,songNameKey)=>{
                                                    let optionString = ""
                                                    if (value === songName.label.value[0]) {
                                                        basicLabelsChildrenCount ++
                                                        this.annotatedSongs[i++] = this.AnnotatedSong(songName.label.value[1], songName.annotations_count)
                                                        optionString = <option key={songNameKey} value={songName.label.value[1]}>{songName.label.value[1]}/{songName.annotations_count}</option>;
                                                    }
                                                    return optionString
                                                })
                                            }
                                        </optgroup>
                                        this.state.basic_labels_children_count[key] = basicLabelsChildrenCount
                                        if (this.state.basic_labels.length === (key + 1) && basicLabelsChildrenCount > 0) {
                                            this.setBasicLabelsCount()
                                        }
                                        return result
                                    })
                                }
                            </select>
                        </td>
                        <td className={styles.tdNames}><SongNames token={this.props.token} songNames={this.state.query_result_song_names} /></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default SongLabels;
