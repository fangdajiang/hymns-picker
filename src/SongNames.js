import React, { Component} from "react";
import {MContext} from "./index";
import styles from './SongNames.module.css';
import {fetchData, ZERO_RESULTS} from "./common";

const SONG_PICTURE_URL_PREFIX = 'https://hymns.oss-cn-shanghai.aliyuncs.com/pics/';
const SONG_PICTURE_URL_SUFFIX = '.png?x-oss-process=image/resize,p_15';
const CN_SONGS_API_URL_PREFIX = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/cnSongs?name=';

class SongNames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter_names:"",
            query_result_song_names: "",
            name:"Hello",
            joy:{
                coding:"Go!"
            }
        }
    }
    async findSongNames() {
        console.log("find song names")

        let resp = await fetchData(CN_SONGS_API_URL_PREFIX + this.state.filter_names);
        return resp;
    }
    queryByName() {
        console.log("queryByName")
        if (this.state.filter_names.trim().length > 1) {
            this.findSongNames().then((resp) => {
                let songNames = ZERO_RESULTS
                if (undefined !== resp) {
                    console.log("found song names length:" + resp.length + ":'" + resp + "'")
                    if (resp.length !== 0) {
                        for (let i in resp) {
                            console.log("song name:'" + resp[i].nameCn + "'")
                            songNames += resp[i].nameCn + ","
                        }
                    } else {
                        console.log("resp length is 0")
                    }
                } else {
                    console.log("resp is undefined")
                }
                this.setState({
                    query_result_song_names: songNames
                })
            })
        } else {
            console.log("filter_names length SHOULD > 1")
        }
    };
    changeName=(event)=> {
        this.state.filter_names = event.target.value
        console.log("inputted song name:" + this.state.filter_names)
        this.queryByName()
    }
    render() {
        console.log("rendering SongNames")
        return (
            <div>
                <li><input name="searchByName" placeholder="过滤歌名" onChange={this.changeName} /></li>
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
                <li>{this.state.name} {this.state.joy.coding}</li>
                <MContext.Consumer>
                    {
                        (context) => (
                            this.props.songNames.split(',').map((songName, key) => {
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
        )
    }
}
export default SongNames;