import React from 'react';
import Select, { components } from "react-select";
import SongNames from "./SongNames";
import styles from "./SongLabels.module.css";
import SongPicture from "./SongPicture";
import {fetchData, NOT_AVAILABLE, ZERO_RESULTS, getTasks, Song} from "./common";

const CATEGORY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels/categories';
const LABELS_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/labels';
const TASK_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs?";
const GROUP1_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/hymns/group1';
const GROUPS_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/hymns/groups';
const GROUP2_SONGS_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs/group2-songs?group2Name=";
const ELASTIC_SEARCH_SUMMARY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/summary';

const LABEL_SOURCE = "标签："
const GROUP_SOURCE = "分类："
const GO_GO_GO = "Warriors, Go!"
const LABELS_SELECT_HEIGHT = 600
const GROUPS_SELECT_SIZE = 40
const sleep = ms => new Promise(
    resolve => setTimeout(resolve, ms)
);
let annotatedLabelSongsIndex = 0;

function findZeroAnnotatedSong(annotatedSongs, selectedItems) {
    console.log("annotatedSongs.length:", annotatedSongs.length, ", selectedItems.length:", selectedItems.length)
    let zeroAnnotations = ""

    // to be improved
    let byGroup = false;
    if (!selectedItems[0].value) {
        byGroup = true;
    }

    for (let annotatedSongsKey in annotatedSongs) {
        for (let selectedItemsKey in selectedItems) {
            let selectedItemValue = selectedItems[selectedItemsKey].value

            // to be improved
            if (byGroup) {
                selectedItemValue = selectedItems[selectedItemsKey]
            }

            if (annotatedSongs[annotatedSongsKey].annotatedItem === selectedItemValue &&
                annotatedSongs[annotatedSongsKey].annotationsCount === 0) {
                console.log("Found selected item with 0 annotations count:" + selectedItemValue)
                zeroAnnotations += selectedItemValue + " "
            }
        }
        if (zeroAnnotations !== "") {
            // break
        }
    }
    return zeroAnnotations;
}

class SongLabels extends React.Component {
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
            key_source: "",
            key_items_for_song_names: GO_GO_GO,
            basic_labels:[],
            song_labels:[],
            selected_labels:[],
            labels_select:"",
            groups_select:"",
            basic_labels_children_count:[],
            hymns_group1:[],
            hymns_groups:[],
            selected_group2: "",
            group1_children_count:[],
            query_by_labels_result_songs: [],
            elastic_search_total_tasks_count:"?",
            elastic_search_annotated_tasks_count:"?",
        }
        this.keyLabelRef = React.createRef();
        this.clearSongLabelSelect = this.clearSongLabelSelect.bind(this)
    }
    clearSongLabelSelect(event) {
        if (event.key === "Escape") {
            console.log("this.state.key_items_for_song_names:" + this.state.key_items_for_song_names)
            this.keyLabelRef.current.clearValue()
            this.state.key_items_for_song_names = GO_GO_GO
            this.setState({
                query_by_labels_result_songs: [],
            })
        }
    }
    changeLabels = (selected_labels) => {
        this.setState({ selected_labels }, () => {
                console.log("Option selected length:", this.state.selected_labels.length)
                if (this.state.selected_labels.length > 0) {
                    let keyLabelStr = ""
                    for (let index in selected_labels) {
                        keyLabelStr += selected_labels[index].value + " "
                    }
                    console.log("keyLabelStr:", keyLabelStr)
                    this.state.key_items_for_song_names = keyLabelStr
                    this.state.key_source = LABEL_SOURCE
                    this.queryByLabels()
                } else {
                    this.setState({
                        query_by_labels_result_songs: [],
                    })
                }
            }
        );
    };

    //请求接口的方法
    async queryBasicLabels() {
        console.log("querying basic labels")

        let resp = await fetchData(CATEGORY_API_URL);
        console.log("basic labels:" + resp);
        this.state.basic_labels = resp;
    }
    async querySongLabels() {
        console.log("querying song labels")

        let resp = await fetchData(LABELS_API_URL);
        console.log("song labels length:" + resp.length);
        // using setState will cause delay assignment and mismatched data
        this.state.song_labels = resp;
    }
    async setOptGroupCount() {
        console.log("setOptGroupCount")
        await sleep(100);
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
    queryByLabels() {
        console.log("queryByLabels")
        let tip = NOT_AVAILABLE

        let zeroAnnotatedLabelSong = findZeroAnnotatedSong(this.annotatedLabelSongs, this.state.selected_labels);
        console.log("zeroAnnotatedLabelSong:'" + zeroAnnotatedLabelSong + "'")
        if (zeroAnnotatedLabelSong.trim().length === 0) {
            if (this.state.selected_labels.length > 0) {
                let selectedLabelsAsQueryString = ""
                for (let index in this.state.selected_labels) {
                    selectedLabelsAsQueryString += "label=" + this.state.selected_labels[index].value + "&"
                }
                getTasks(TASK_API_PREFIX_URL + selectedLabelsAsQueryString).then((resp) => {
                    console.log("resp:'" + resp + "'")
                    if (resp.length === 0) {
                        let songs = []
                        songs.push(new Song(ZERO_RESULTS, ZERO_RESULTS))
                        resp = songs
                    }
                    this.setState({
                        query_by_labels_result_songs: resp
                    })
                })
                console.log("getTasks done")
            } else {
                tip = "(0 label selected.)"
                this.state.query_by_labels_result_songs.push(new Song(tip, tip))
            }
        } else {
            tip = "(selected label '" + zeroAnnotatedLabelSong + "' has not been labeled by any Hymn.)"
            this.state.query_by_labels_result_songs.push(new Song(tip, tip))
        }
    };
    getLabelsOptions() {
        console.log("getLabelsOptions")
        let basicLabels = [];
        for (let basicLabelIndex in this.state.basic_labels) {
            let labelsOption = this.assembleLabelGroups(basicLabelIndex)
            basicLabels.push({
                label: this.state.basic_labels[basicLabelIndex] + "/" + this.state.basic_labels_children_count[basicLabelIndex],
                options: labelsOption
            })
        }
        return basicLabels
    }
    assembleLabelGroups(basicLabelIndex) {
        console.log("assembleLabelGroups")
        this.basicLabelsChildrenCount = 0
        let songLabels = [];
        for (let categoryLabelIndex in this.state.song_labels) {
            if (this.state.basic_labels[basicLabelIndex] === this.state.song_labels[categoryLabelIndex].category) {
                this.basicLabelsChildrenCount ++
                this.annotatedLabelSongs[annotatedLabelSongsIndex++] = this.AnnotatedLabelSong(this.state.song_labels[categoryLabelIndex].label, this.state.song_labels[categoryLabelIndex].annotatedLabelCount)
                songLabels.push({
                    value: this.state.song_labels[categoryLabelIndex].label,
                    label: this.state.song_labels[categoryLabelIndex].label + "/" +
                        this.state.song_labels[categoryLabelIndex].annotatedLabelCount
                })
            }
        }
        this.state.basic_labels_children_count[basicLabelIndex] = this.basicLabelsChildrenCount
        return songLabels
    }
    getLabelsSelect() {
        console.log("getLabelsSelect")
        // handle options group header click event
        // hide and show the options under clicked group
        const handleHeaderClick = id => {
            const node = document.querySelector(`#${id}`).parentElement.nextElementSibling;
            const classes = node.classList;
            if (classes.contains("collapsed")) {
                node.classList.remove("collapsed");
            } else {
                node.classList.add("collapsed");
            }
        };
        // Create custom GroupHeading component, which will wrap
        // react-select GroupHeading component inside a div and
        // register onClick event on that div
        const CustomGroupHeading = props => {
            return (
                <div
                    className="group-heading-wrapper"
                    onClick={() => handleHeaderClick(props.id)}
                >
                    <components.GroupHeading {...props} />
                </div>
            );
        };
        const { selectedOption } = this.state;
        return <div className={styles.container}>
            <Select
                className={styles.songLabelSelect}
                id="keyLabelId"
                placeholder="查找标签，例如：感恩"
                isMulti
                menuIsOpen
                maxMenuHeight={LABELS_SELECT_HEIGHT}
                ref={this.keyLabelRef}
                onKeyDown={this.clearSongLabelSelect}
                value={selectedOption}
                onChange={this.changeLabels}
                options={this.getLabelsOptions()}
                components={{ GroupHeading: CustomGroupHeading }}
            />
        </div>
    }

    async querySongGroup1() {
        console.log("querying song group1")

        let resp = await fetchData(GROUP1_API_URL);
        console.log("song group1:" + resp);
        this.state.hymns_group1 = resp;
    }
    async querySongGroups() {
        console.log("querying song groups")

        let resp = await fetchData(GROUPS_API_URL);
        console.log("song groups length:" + resp.length);
        this.state.hymns_groups = resp;
    }
    queryByGroup2() {
        console.log("queryByGroup2")
        let tip = NOT_AVAILABLE

        let zeroAnnotatedLabelSong = findZeroAnnotatedSong(this.annotatedGroupSongs, this.state.selected_group2);
        console.log("zeroAnnotatedLabelSong:'" + zeroAnnotatedLabelSong + "'")

        if (zeroAnnotatedLabelSong.trim().length === 0) {
            if (this.state.selected_group2.length > 0) {
                getTasks(GROUP2_SONGS_API_PREFIX_URL + this.state.selected_group2).then((resp) => {
                    console.log("resp:'" + resp + "'")
                    if (resp.length === 0) {
                        let songs = []
                        songs.push(new Song(ZERO_RESULTS, ZERO_RESULTS))
                        resp = songs
                    }
                    this.setState({
                        query_by_labels_result_songs: resp
                    })
                })
            } else {
                tip = "(0 group selected.)"
                this.state.query_by_labels_result_songs.push(new Song(tip, tip))
            }
        } else {
            tip = "(selected group '" + zeroAnnotatedLabelSong + "' doesn't have any Hymn.)"
            this.state.query_by_labels_result_songs.push(new Song(tip, tip))
        }
    };
    getGroupsSelect() {
        console.log("getGroupsSelect")
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

    async queryElasticSearchSummary() {
        console.log("querying elastic search summary")
        let resp = await fetchData(ELASTIC_SEARCH_SUMMARY_API_URL);
        console.log("elastic search total number: " + resp.totalNumber + ", elastic search annotation count: " + resp.annotationCount);
        this.setState({
            elastic_search_total_tasks_count:resp.totalNumber,
            elastic_search_annotated_tasks_count:resp.annotationCount,
        })
    }

    changeGroup=(event)=> {
        let group = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected group2 name changed:" + group)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_group2 = group
        this.state.key_items_for_song_names = group
        this.state.key_source = GROUP_SOURCE
        this.queryByGroup2()
        this.keyLabelRef.current.clearValue()
    }
    componentDidMount() {
        // to avoid loading groups failure on prod(local works!), groups must be run before labels
        this.querySongGroups().then(() => {
            this.querySongGroup1().then(() => {
                this.querySongLabels().then(() => {
                    this.queryBasicLabels().then(() => {
                        this.state.labels_select = this.getLabelsSelect()
                        this.queryElasticSearchSummary().then(() => {
                            this.state.groups_select = this.getGroupsSelect()
                            this.setOptGroupCount().then()
                        });
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
                        <td>按标签过滤诗歌</td>
                        <td>诗歌列表【总数：<span title={"已打标签：" + this.state.elastic_search_annotated_tasks_count}>{this.state.elastic_search_total_tasks_count}</span>】</td>
                        <td>谱/歌词/相关经文/作者</td>
                        <td>按分类过滤诗歌</td>
                    </tr>
                    <tr>
                        <td className={styles.tdLabels}>
                            <div id="hymnLabels">
                                {
                                    this.state.labels_select
                                }
                            </div>
                        </td>
                        <td className={styles.tdNames}><SongNames token={this.props.token} keySource={this.state.key_source} keyLabels={this.state.key_items_for_song_names} songs={this.state.query_by_labels_result_songs} /></td>
                        <td className={styles.tdPic}><SongPicture /></td>
                        <td className={styles.tdGroup}>
                            <div id="hymnGroups">
                                {
                                    this.state.groups_select
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
