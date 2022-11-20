import React, { Component} from "react";
import {MContext} from "./index";
import styles from './SongNames.module.css';

const SONG_PICTURE_URL_PREFIX = 'https://hymns.oss-cn-shanghai.aliyuncs.com/pics/';
const SONG_PICTURE_URL_SUFFIX = '.png?x-oss-process=image/resize,p_15';

class SongNames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:"Hello",
            joy:{
                coding:"Go!"
            }
        }
    }
    render() {
        console.log("rendering SongNames")
        return (
            <div>
                <li>{this.state.name} {this.state.joy.coding}</li>
                <MContext.Consumer>
                    {
                        (context) => (
                            this.props.songNames.split(',').map((songName, key) => {
                                if (songName !== "") {
                                    return <li key={key}>
                                        <a className={styles.songName} href="/#" onClick={()=>{
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