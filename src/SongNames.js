import React, { Component} from "react";
import {MContext} from "./index";
import styles from './SongNames.module.css';
import {Song, fetchData, ZERO_RESULTS, NEED_MORE_WORDS, splitLabels} from "./common";
import "semantic-ui-css/semantic.min.css";
import { Popup } from "semantic-ui-react";
import HtmlReactParser from 'html-react-parser';

const SONG_PICTURE_URL_PREFIX = 'https://hymns.oss-cn-shanghai.aliyuncs.com/pics/';
const SONG_PICTURE_URL_SUFFIX = '.png?x-oss-process=image/resize,p_15';
const CN_SONGS_API_URL_PREFIX = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/cnSongs?name=';

class SongNames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter_names:"",
            last_props_songs: this.props.songs,
            query_result_songs: this.props.songs,
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
            let songs = []
            this.clearResults(songs.push(new Song("", "")))
        }
    }
    async findSongs() {
        console.log("find songs")

        let resp = await fetchData(CN_SONGS_API_URL_PREFIX + this.state.filter_names);
        return resp;
    }
    queryByName() {
        console.log("queryByName")
        if (this.state.filter_names.trim().length > 1) {
            this.findSongs().then((resp) => {
                let songs = []
                if (undefined !== resp && 0 !== resp.length) {
                    console.log("found song length:", resp.length)
                    for (let i in resp) {
                        songs.push(new Song(resp[i].nameCn, splitLabels(resp[i].labels)))
                    }
                } else {
                    console.log("resp is undefined or length 0")
                    songs.push(new Song(ZERO_RESULTS, ZERO_RESULTS))
                }
                this.setState({
                    query_result_songs: songs
                })
            })
        } else if (this.state.filter_names.trim().length === 1) {
            console.log("filter_names length SHOULD > 1")
            let songs = []
            this.clearResults(songs.push(new Song(NEED_MORE_WORDS, NEED_MORE_WORDS)))
        } else {
            let songs = []
            this.clearResults(songs.push(new Song("", "")))
        }
    };
    clearResults(emptyArray) {
        this.setState({
            query_result_songs: emptyArray
        })
    }
    changeName=(event)=> {
        this.state.filter_names = event.target.value
        console.log("inputted song name:" + this.state.filter_names)
        this.queryByName()
    }
    render() {
        console.log("rendering SongNames")
        if (this.state.last_props_songs !== this.props.songs) {
            console.log("new results coming:" + this.props.songs)
            this.state.songs = this.props.songs
            this.state.query_result_songs = this.props.songs
            document.getElementById("searchByName").value = ""
        } else {
            console.log("using last props songs:" + this.state.last_props_songs)
        }
        return (
            <div className={styles.songNameDiv}>
                <ul>
                    <li key="searchByNameKey"><input className={styles.searchByNameInput} id="searchByName" placeholder="查找歌名，例如：平安夜" ref={this.searchByName} onKeyUp={this.clearSearchByName} onChange={this.changeName} /></li>
                    <li key="navKey"><span className={styles.helloGo}>{this.props.keySource}{this.props.keyLabels}</span></li>
                    <MContext.Consumer>
                        {
                            (context) => (
                                this.state.query_result_songs.map((song, key) =>
                                    <span key={key}>
                                    <Popup
                                        mouseEnterDelay={500}
                                        trigger={<li>
                                            <a className={styles.songName} href="#!" onClick={()=>{
                                                context.setImage(
                                                    SONG_PICTURE_URL_PREFIX + song.nameCn + SONG_PICTURE_URL_SUFFIX,
                                                    SONG_PICTURE_URL_PREFIX + song.nameCn,
                                                    song.nameCn)
                                            }}>
                                                { song.nameCn }
                                            </a><span className={styles.songAction}> >> </span>
                                        </li>}
                                        position="right center"
                                        content={ HtmlReactParser(song.labels) }
                                        size="large"
                                        header="相关标签"
                                    />
                                    </span>
                                )
                            )
                        }
                    </MContext.Consumer>
                </ul>
            </div>
        )
    }
}
export default SongNames;