import React from 'react';
import SongNames from "./SongNames";
import styles from "./SongLabels.module.css";
import SongPicture from "./SongPicture";

const CATEGORY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels/categories';
const LABELS_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels';
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

        let resp = await this.fetchData(CATEGORY_API_URL);
        console.log("resp:" + resp);
        this.setState({
            basic_labels:resp,
        })
    }
    async getSongLabels() {
        console.log("getting song labels")

        let resp = await this.fetchData(LABELS_API_URL);
        this.setState({
            song_labels:resp
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

    changeLabel=(event)=> {
        let labelValue = event.target.value;
        console.log("input label:" + labelValue)
        console.log("basic_labels size:" + this.state.basic_labels.length + "," + this.state.basic_labels)
        // document.getElementById("hymnLabels").style.visibility = "hidden"
        if (labelValue.trim().length > 0) {
            let selectComponentPrefix = "<select name=\"filteredKeyLabels\" multiple size=\"20\" onchange=alert('ok')>"
            let selectComponentSuffix = "</select>"
            let optionGroupPrefix = ""
            let optionGroupSuffix = "</optgroup>"
            this.state.song_labels.map((categoryLabel,categoryLabelKey)=>{
                if (categoryLabel.label.includes(labelValue)) {
                    optionGroupPrefix += "<optgroup label=" + categoryLabel.category + ">"
                    optionGroupPrefix += "<option id=" + categoryLabelKey + " value=" + categoryLabel.label + ">" +
                        categoryLabel.label + "/" +
                        categoryLabel.labelAnnotatedCount + "</option>"
                }
            })
            document.getElementById("hymnLabels").innerHTML = selectComponentPrefix + optionGroupPrefix + optionGroupSuffix + selectComponentSuffix
        } else {
            console.log("input label is EMPTY")
        }
    }
    basicLabelsChildrenCount;
    i;

    rearrangeLabels(labelPart) {
        let doFilter = false;
        if (labelPart.trim().length > 0) {
            console.log("labelPart:" + labelPart)
            doFilter = true;
        } else {
            console.log("labelPart is EMPTY")
        }
        return this.state.basic_labels.map((basicLabel, key) => {
            return <optgroup key={key} id={"bl" + key} label={basicLabel}>
                {
                    this.state.song_labels.map((categoryLabel, categoryLabelKey) => {
                        if ((!doFilter || categoryLabel.label.includes(labelPart)) &&
                            basicLabel === categoryLabel.category) {
                            return <option key={categoryLabelKey} value={categoryLabel.label}>
                                {categoryLabel.label}/{categoryLabel.labelAnnotatedCount}
                            </option>
                        }
                    })
                }
            </optgroup>
        })
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
        return (
            <div>
                <table className={styles.tbl}>
                    <tbody>
                    <tr>
                        <td>过滤标签<br/>（多选按 ⌘ (Win:Ctrl）</td>
                        <td>诗歌列表</td>
                        <td>谱/歌词/相关经文/作者</td>
                    </tr>
                    <tr>
                        <td className={styles.tdLabels}>
                            <input name="searchByLabel" placeholder="输入标签来过滤" onChange={this.changeLabel} />
                            <div id="hymnLabels">
                            <select name="keyLabels" multiple size={40} onChange={this.change}>
                                {
                                    this.rearrangeLabels("圣")
                                }
                            </select>
                            </div>
                        </td>
                        <td className={styles.tdNames}><SongNames token={this.props.token} songNames={this.state.query_result_song_names} /></td>
                        <td className={styles.tdPic}><SongPicture /></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
export default SongLabels;
