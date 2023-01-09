import React, {Component} from "react";
import styles from './SongGroup.module.css';
import {MContext} from "./index";
import {NOT_AVAILABLE, ZERO_RESULTS, getTasks} from "./common";

const GROUP2_SONGS_API_PREFIX_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + "/songs/group2-songs?group2Name=";

class SongGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query_result_song_names: "",
            selected_group2: ""
        }
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
                    query_result_song_names: resp
                })
            })
        } else {
            songNames = "(0 words selected.)"
            this.setState({
                query_result_song_names: songNames
            })
        }
    };
    changeGroup=(event)=> {
        let group = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected group2 name changed:" + group)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_group2 = group
        this.queryByGroup2()
    }
    render() {
        console.log("rendering SongGroup")
        return (
            <MContext.Consumer>
                {
                    (context) => (
                        <select className={styles.songGroup} name="keyGroups" size={40} onChange={this.changeGroup}>
                            {
                                this.props.hymnsGroup1.map((group1, key) => {
                                    return <optgroup key={key} label={group1}>
                                        {
                                            this.props.hymnsGroups.map((groups, groupsKey) => {
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
                    )
                }
            </MContext.Consumer>
        )
    }
}
export default SongGroup;