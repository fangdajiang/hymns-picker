import React, { Component} from "react";
import {MContext} from "./index";
import styles from "./SongPicture.module.css";

class SongPicture extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alt:"诗歌谱",
            url:"./tlbc.png"
        }
    }
    render() {
        return (
            <div>
                <div><MContext.Consumer>
                    {
                        (context) => (
                            <a className={styles.songPic} href={context.state.originalUrl + ".png"} title={"下载" + context.state.alt}>
                                <img src={context.state.resizedUrl} alt={context.state.alt}/>
                            </a>
                        )
                    }
                </MContext.Consumer></div>
                <div><img src={this.state.url}  alt={this.state.alt}/></div>
            </div>
        )
    }
}
export default SongPicture;