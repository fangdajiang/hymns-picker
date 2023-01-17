import React, {useEffect, useState} from 'react';
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

const GO_GO_GO = "Warriors, Go!"
const INVALID_CONDITIONS = "(请修改过滤标签)"
const LABELS_SELECT_SIZE = 40
const GROUPS_SELECT_SIZE = 40
const sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);

function findZeroAnnotatedSong(annotatedSongs, selectedItems) {
    let zeroAnnotations = ""
    for (let annotatedSongsKey in annotatedSongs) {
        for (let selectedItemsKey in selectedItems) {
            if (annotatedSongs[annotatedSongsKey].annotatedItem === selectedItems[selectedItemsKey] &&
                annotatedSongs[annotatedSongsKey].annotationsCount === 0) {
                console.log("Found selected item with 0 annotations count:" + selectedItems[selectedItemsKey])
                zeroAnnotations += selectedItems[selectedItemsKey] + " "
            }
        }
        if (zeroAnnotations !== "") {
            // break
        }
    }
    return zeroAnnotations;
}

class SongLabels extends React.Component {
    initScript = () => {
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.async = true
        script.src = './select2.full.min.js'
        document.head.appendChild(script)
    }

    AnnotatedLabelSong = (annotatedItem, annotationsCount) => {
        return {annotatedItem: annotatedItem, annotationsCount: annotationsCount}
    }
    annotatedLabelSongs = [this.AnnotatedLabelSong];
    AnnotatedGroupSong = (annotatedItem, annotationsCount) => {
        return {annotatedItem: annotatedItem, annotationsCount: annotationsCount}
    }
    annotatedGroupSongs = [this.AnnotatedGroupSong];
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            key_labels_for_song_names: GO_GO_GO,
            hymns_group1:[],
            hymns_groups:[],
            basic_labels_children_count:[],
            group1_children_count:[],
            basic_labels:[],
            song_labels:[],
            selected_labels:[],
            selected_group2: "",
            filter_labels:"",
            rearranged_labels:"",
            query_by_labels_result_song_names: ""
        }
        this.searchByLabel = React.createRef();
        this.keyLabels = React.createRef();
        this.clearSearchByLabel = this.clearSearchByLabel.bind(this)
    }
    clearSearchByLabel(event) {
        if (event.key === "Escape") {
            console.log("this.state.key_labels_for_song_names:" + this.state.key_labels_for_song_names)
            this.state.key_labels_for_song_names = GO_GO_GO
            if (this.searchByLabel.current.value.trim() !== '') {
                this.searchByLabel.current.value = "";
            }
            let opts = document.getElementById("keyLabels").options;
            for (let i = 0; i < opts.length; i++) {
                opts[i].selected = false;
            }
            this.updateData("")
        }
    }
    changeSearchByLabel=(event)=> {
        this.updateData(event.target.value)
    }
    changeLabels=(event)=> {
        let labelArray = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected labels changed:" + labelArray)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_labels = labelArray
        let keyLabels = ""
        for (let index in labelArray) {
            keyLabels += labelArray[index] + " "
        }
        this.state.key_labels_for_song_names = keyLabels
        this.queryByLabels()
    }
    updateData(filterLabelsValue) {
        this.state.filter_labels = filterLabelsValue
        this.setState({
            query_by_labels_result_song_names: "",
            rearranged_labels: this.rearrangeLabels(),
        })
    }

    //请求接口的方法
    async getBasicLabels() {
        console.log("getting basic labels")

        let resp = await fetchData(CATEGORY_API_URL);
        console.log("basic labels:" + resp);
        this.state.basic_labels = resp;
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

        let zeroAnnotatedLabelSong = findZeroAnnotatedSong(this.annotatedLabelSongs, this.state.selected_labels);
        console.log("zeroAnnotatedLabelSong:'" + zeroAnnotatedLabelSong + "'")
        if (zeroAnnotatedLabelSong.trim().length === 0) {
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
                songNames = "(0 label selected.)"
                this.setState({
                    query_by_labels_result_song_names: songNames
                })
            }
        } else {
            songNames = "(selected label '" + zeroAnnotatedLabelSong + "' has not been labeled by any Hymn.)"
            this.setState({
                query_by_labels_result_song_names: songNames
            })
        }
    };
    async setOptGroupCount() {
        await sleep(2800);
        let bl0 = document.getElementById("bl0");
        if (bl0 != null) {
            for (let i = 0; i < this.state.basic_labels.length; i++) {
                let optGroupLabel = document.getElementById("bl" + i).getAttribute("label")
                document.getElementById("bl" + i).setAttribute("label", optGroupLabel + "/" + this.state.basic_labels_children_count[i])
            }
        } else {
            console.log("setOptGroupCount basic label FAILED, bl0:" + bl0)
        }
        let group0 = document.getElementById("group0");
        if (group0 != null) {
            for (let i = 0; i < this.state.hymns_group1.length; i++) {
                let optGroupLabel = document.getElementById("group" + i).getAttribute("label")
                document.getElementById("group" + i).setAttribute("label", optGroupLabel + "/" + this.state.group1_children_count[i])
            }
        } else {
            console.log("setOptGroupCount group FAILED, group0:" + group0)
        }
    }

    async getSongGroup1() {
        console.log("getting song group1")

        let resp = await fetchData(GROUP1_API_URL);
        console.log("song group1:" + resp);
        this.state.hymns_group1 = resp;
    }
    async getSongGroups() {
        console.log("getting song groups")

        let resp = await fetchData(GROUPS_API_URL);
        console.log("song groups length:" + resp.length);
        this.state.hymns_groups = resp;
    }

    rearrangeLabels() {
        let doFilter = false;
        if (this.state.filter_labels.trim().length > 0) {
            console.log("filter labels:" + this.state.filter_labels)
            doFilter = true;
        } else {
            console.log("filter label(s) is EMPTY")
        }
        let i = 0;
        return <select id="keyLabels" multiple size={LABELS_SELECT_SIZE} ref={this.keyLabels} onKeyUp={this.clearSearchByLabel} onChange={this.changeLabels}>
            {
                this.state.basic_labels.map((basicLabel, key) => {
                    // console.log("basicLabel:" + basicLabel)
                    this.basicLabelsChildrenCount = 0
                    let result = <optgroup key={key} id={"bl" + key} label={basicLabel}>
                        {
                            this.state.song_labels.map((categoryLabel, categoryLabelKey) => {
                                if ((!doFilter || categoryLabel.label.includes(this.state.filter_labels)) &&
                                    basicLabel === categoryLabel.category) {
                                    // console.log("categoryLabel.label:" + categoryLabel.label)
                                    this.basicLabelsChildrenCount ++
                                    this.annotatedLabelSongs[i++] = this.AnnotatedLabelSong(categoryLabel.label, categoryLabel.annotatedLabelCount)
                                    return <option className={styles.labelItem} key={categoryLabelKey} value={categoryLabel.label}>
                                        {categoryLabel.label}/{categoryLabel.annotatedLabelCount}
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

        let zeroAnnotatedLabelSong = findZeroAnnotatedSong(this.annotatedGroupSongs, this.state.selected_group2);
        console.log("zeroAnnotatedLabelSong:'" + zeroAnnotatedLabelSong + "'")

        if (zeroAnnotatedLabelSong.trim().length === 0) {
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
                songNames = "(0 group selected.)"
                this.setState({
                    query_by_labels_result_song_names: songNames
                })
            }
        } else {
            songNames = "(selected group '" + zeroAnnotatedLabelSong + "' doesn't have any Hymn.)"
            this.setState({
                query_by_labels_result_song_names: songNames
            })
        }
    };
    getGroups() {
        let i = 0;
        return <select className={styles.songGroup} name="keyGroups" size={GROUPS_SELECT_SIZE} onChange={this.changeGroup}>
            {
                this.state.hymns_group1.map((group1, key) => {
                    this.group1ChildrenCount = 0
                    let result = <optgroup key={key} id={"group" + key} label={group1}>
                        {
                            this.state.hymns_groups.map((groups, groupsKey) => {
                                if (group1 === groups.group1) {
                                    this.group1ChildrenCount ++
                                    this.annotatedGroupSongs[i++] = this.AnnotatedGroupSong(groups.group2, groups.annotatedGroupCount)
                                    return <option className={styles.songGroupItem} key={groupsKey} value={groups.group2}>
                                        {groups.group2}/{groups.annotatedGroupCount}
                                    </option>
                                }
                            })
                        }
                    </optgroup>
                    this.state.group1_children_count[key] = this.group1ChildrenCount
                    return result
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
        // to avoid loading groups failure on prod(local works!), groups must be run before labels
        this.getSongGroups().then(() => {
            this.getSongGroup1().then(() => {
                this.getSongLabels().then(() => {
                    this.getBasicLabels().then(() => {
                        this.state.rearranged_labels = this.rearrangeLabels()
                        this.setOptGroupCount().then()
                    })
                })
            })
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
                            <input name="searchByLabel" placeholder="查找标签" ref={this.searchByLabel} onKeyUp={this.clearSearchByLabel} onChange={this.changeSearchByLabel} />
                            <div id="hymnLabels">
                                {
                                    this.state.rearranged_labels
                                }
                            </div>
                        </td>
                        <td className={styles.tdNames}><SongNames token={this.props.token} keyLabels={this.state.key_labels_for_song_names} songNames={this.state.query_by_labels_result_song_names} /></td>
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
