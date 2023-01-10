import React from 'react';
import ReactDOMServer from 'react-dom/server';
import SongNames from "./SongNames";
import styles from "./SongLabels.module.css";
import SongPicture from "./SongPicture";
import { fetchData, NOT_AVAILABLE, ZERO_RESULTS, getTasks } from "./common";

const CATEGORY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels/categories';
const LABELS_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels';
const TASK_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs?";
const GROUP1_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/hymns/group1';
const GROUPS_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/hymns/groups';
const GROUP2_SONGS_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs/group2-songs?group2Name=";

const INVALID_CONDITIONS = "(请修改过滤标签)"
const sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);
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
            hymns_group1:[],
            hymns_groups:[],
            basic_labels_children_count:[],
            basic_labels:[],
            song_labels:[],
            selected_labels:[],
            selected_group2: "",
            filter_labels:"",
            rearranged_labels:[],
            query_by_labels_result_song_names: ""
        }
    }
    //请求接口的方法
    async getBasicLabels() {
        console.log("getting basic labels")

        let resp = await fetchData(CATEGORY_API_URL);
        console.log("basic labels:" + resp);
        this.setState({
            basic_labels:resp,
        })
    }
    async getSongLabels() {
        console.log("getting song labels")

        let resp = await fetchData(LABELS_API_URL);
        console.log("song labels length:" + resp.length);
        // using setState will cause delay assignment and mismatched data
        this.state.song_labels = resp;
    }
    queryByLabels() {
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
                console.log("this.state.selected_labels:'" + this.state.selected_labels + "'")
                if (this.state.selected_labels.length > 0) {
                    let selectedLabelsAsQueryString = ""
                    for (let index in this.state.selected_labels) {
                        selectedLabelsAsQueryString += "label=" + this.state.selected_labels[index] + "&"
                    }
                    getTasks(TASK_API_PREFIX_URL + selectedLabelsAsQueryString).then((resp) => {
                        console.log("resp:'" + resp + "'")
                        if (resp.trim().length === 0) {
                            resp = ZERO_RESULTS
                        }
                        this.setState({
                            query_by_labels_result_song_names: resp
                        })
                    })
                    console.log("getTasks done")
                } else {
                    songNames = INVALID_CONDITIONS
                    this.setState({
                        query_by_labels_result_song_names: songNames
                    })
                }
            } else {
                songNames = "(0 words selected.)"
                this.setState({
                    query_by_labels_result_song_names: songNames
                })
            }
        } else {
            songNames = "(selected label '" + zeroAnnotatedSong + "' has not been labeled by any Hymn.)"
            this.setState({
                query_by_labels_result_song_names: songNames
            })
        }
    };
    async setBasicLabelsCount() {
        await sleep(2800);
        let bl0 = document.getElementById("bl0");
        if (bl0 != null) {
            for (let i = 0; i < this.state.basic_labels.length; i++) {
                let optGroupLabel = document.getElementById("bl" + i).getAttribute("label")
                document.getElementById("bl" + i).setAttribute("label", optGroupLabel + "/" + this.state.basic_labels_children_count[i])
            }
        } else {
            console.log("setBasicLabelsCount FAILED, bl0:" + bl0)
        }
    }

    async getSongGroup1() {
        console.log("getting song group1")

        let resp = await fetchData(GROUP1_API_URL);
        this.state.hymns_group1 = resp;
    }
    async getSongGroups() {
        console.log("getting song groups")

        let resp = await fetchData(GROUPS_API_URL);
        this.state.hymns_groups = resp;
    }

    changeLabel=(event)=> {
        this.state.filter_labels = event.target.value
        this.state.rearranged_labels = this.rearrangeLabels()
        // this will cause the loss of onChange event
        document.getElementById("hymnLabels").innerHTML = ReactDOMServer.renderToStaticMarkup(this.state.rearranged_labels)
    }
    changeLabels=(event)=> {
        let labelArray = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected labels changed:" + labelArray)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_labels = labelArray
        this.queryByLabels()
    }

    rearrangeLabels() {
        let doFilter = false;
        if (this.state.filter_labels.trim().length > 0) {
            console.log("filter labels:" + this.state.filter_labels)
            doFilter = true;
        } else {
            console.log("filter label(s) is EMPTY")
        }
        return <select name="keyLabels" multiple size={40} onChange={this.changeLabels}>
            {
                this.state.basic_labels.map((basicLabel, key) => {
                    this.basicLabelsChildrenCount = 0
                    let result = <optgroup key={key} id={"bl" + key} label={basicLabel}>
                        {
                            this.state.song_labels.map((categoryLabel, categoryLabelKey) => {
                                if ((!doFilter || categoryLabel.label.includes(this.state.filter_labels)) &&
                                    basicLabel === categoryLabel.category) {
                                    this.basicLabelsChildrenCount ++
                                    let i = 0;
                                    this.annotatedSongs[i++] = this.AnnotatedSong(categoryLabel.label, categoryLabel.labelAnnotatedCount)
                                    return <option className={styles.labelItem} key={categoryLabelKey} value={categoryLabel.label}>
                                        {categoryLabel.label}/{categoryLabel.labelAnnotatedCount}
                                    </option>
                                }
                            })
                        }
                    </optgroup>
                    this.state.basic_labels_children_count[key] = this.basicLabelsChildrenCount
                    return result
                })
            }
        </select>
    }

    queryByGroup2() {
        console.log("queryByGroup2")
        let songNames = NOT_AVAILABLE
        if (this.state.selected_group2.length > 0) {
            getTasks(GROUP2_SONGS_API_PREFIX_URL + this.state.selected_group2).then((resp) => {
                console.log("resp:'" + resp + "'")
                if (resp.trim().length === 0) {
                    resp = ZERO_RESULTS
                }
                this.setState({
                    query_by_labels_result_song_names: resp
                })
            })
        } else {
            songNames = "(0 words selected.)"
            this.setState({
                query_by_labels_result_song_names: songNames
            })
        }
    };
    getGroups() {
        return <select className={styles.songGroup} name="keyGroups" size={40} onChange={this.changeGroup}>
            {
                this.state.hymns_group1.map((group1, key) => {
                    return <optgroup key={key} label={group1}>
                        {
                            this.state.hymns_groups.map((groups, groupsKey) => {
                                if (group1 === groups.group1) {
                                    return <option className={styles.songGroupItem} key={groupsKey} value={groups.group2}>
                                        {groups.group2}
                                    </option>
                                }
                            })
                        }
                    </optgroup>
                })
            }
        </select>
    }
    changeGroup=(event)=> {
        let group = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected group2 name changed:" + group)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_group2 = group
        this.queryByGroup2()
    }
    componentDidMount() {
        this.getSongLabels().then(() => {
            this.getBasicLabels().then(() => {
                this.state.rearranged_labels = this.rearrangeLabels()
                this.setBasicLabelsCount().then()
            })
        })

        this.getSongGroups().then(() => {
            this.getSongGroup1().then()
        })

    }
    render() {
        console.log("rendering SongLabels")
        return (
            <div>
                <table className={styles.tbl}>
                    <tbody>
                    <tr>
                        <td>按标签过滤诗歌<br/>（多选按 ⌘ (Win:Ctrl）</td>
                        <td>诗歌列表</td>
                        <td>谱/歌词/相关经文/作者</td>
                        <td>按组过滤诗歌</td>
                    </tr>
                    <tr>
                        <td className={styles.tdLabels}>
                            <input name="searchByLabel" placeholder="查询标签" disabled onChange={this.changeLabel} />
                            <div id="hymnLabels">
                                {
                                    this.rearrangeLabels()
                                }
                            </div>
                        </td>
                        <td className={styles.tdNames}><SongNames token={this.props.token} songNames={this.state.query_by_labels_result_song_names} /></td>
                        <td className={styles.tdPic}><SongPicture /></td>
                        <td className={styles.tdGroup}>
                            <div id="hymnGroups">
                                {
                                    this.getGroups()
                                }
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
export default SongLabels;
