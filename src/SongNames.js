import React, { Component} from "react";
import {MContext} from "./index";
import styles from './SongNames.module.css';
import {fetchData, ZERO_RESULTS, NEED_MORE_WORDS} from "./common";

const SONG_PICTURE_URL_PREFIX = 'https://hymns.oss-cn-shanghai.aliyuncs.com/pics/';
const SONG_PICTURE_URL_SUFFIX = '.png?x-oss-process=image/resize,p_15';
const CN_SONGS_API_URL_PREFIX = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/cnSongs?name=';

class SongNames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter_names:"",
            last_props_songNames: this.props.songNames,
            query_result_song_names: this.props.songNames,
            name:"Hello",
            joy:{
                coding:"Go!"
            }
        }
        this.searchByName = React.createRef();
        this.clearSearchByName = this.clearSearchByName.bind(this)
    }
    clearSearchByName(event) {
        if (event.key === "Escape" && this.searchByName.current.value.trim() !== ''){
            this.searchByName.current.value = "";
            this.searchByName.current.focus();
            this.clearResults("")
        }
    }
    async findSongNames() {
        console.log("find song names")

        let resp = await fetchData(CN_SONGS_API_URL_PREFIX + this.state.filter_names);
        return resp;
    }
    queryByName() {
        console.log("queryByName")
        let songNames = ""
        if (this.state.filter_names.trim().length > 1) {
            this.findSongNames().then((resp) => {
                if (undefined !== resp && 0 !== resp.length) {
                    console.log("found song names length:" + resp.length)
                    for (let i in resp) {
                        songNames += resp[i].nameCn + ","
                    }
                } else {
                    console.log("resp is undefined or length 0")
                    songNames = ZERO_RESULTS
                }
                this.setState({
                    query_result_song_names: songNames
                })
            })
        } else if (this.state.filter_names.trim().length === 1) {
            console.log("filter_names length SHOULD > 1")
            this.clearResults(NEED_MORE_WORDS)
        } else {
            this.clearResults("")
        }
    };
    clearResults(empty) {
        this.setState({
            query_result_song_names: empty
        })
    }
    changeName=(event)=> {
        this.state.filter_names = event.target.value
        console.log("inputted song name:" + this.state.filter_names)
        this.queryByName()
    }
    render() {
        console.log("rendering SongNames")
        if (this.state.last_props_songNames !== this.props.songNames) {
            console.log("new results coming:" + this.props.songNames)
            this.state.last_props_songNames = this.props.songNames
            this.state.query_result_song_names = this.props.songNames
            document.getElementById("searchByName").value = ""
        } else {
            console.log("using last props songNames:" + this.state.last_props_songNames)
        }
        return (
            <div>
                <li>{this.state.name} {this.state.joy.coding}</li>
                <li><input id="searchByName" placeholder="查找歌名" ref={this.searchByName} onKeyUp={this.clearSearchByName} onChange={this.changeName} /></li>
                <div id="hymnNames">
                    <MContext.Consumer>
                        {
                            (context) => (
                                this.state.query_result_song_names.split(',').map((songName, key) => {
                                    if (songName !== "") {
                                        return <li key={key}>
                                            <a className={styles.songName} href="#!" onClick={()=>{
                                                context.setImage(
                                                    SONG_PICTURE_URL_PREFIX + songName + SONG_PICTURE_URL_SUFFIX,
                                                    SONG_PICTURE_URL_PREFIX + songName,
                                                    songName)
                                            }}>
                                                { songName }
                                            </a>
                                        </li>
                                    } else {
                                        return ""
                                    }
                                })
                            )
                        }
                    </MContext.Consumer>
                </div>
            </div>
        )
    }
}
export default SongNames;