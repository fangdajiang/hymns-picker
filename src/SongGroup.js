import React, {Component} from "react";
import styles from './SongGroup.module.css';
import {MContext} from "./index";

class SongGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected_group2: ""
        }
    }
    change=(event)=> {
        let labelArray = Array.from(event.target.selectedOptions, option => option.value);
        console.log("selected group2 name changed:" + labelArray)
        // using setState will cause delay assignment and mismatched data
        this.state.selected_group2 = labelArray
        this.queryByLabels().then()
    }
    render() {
        console.log("rendering SongGroup")
        return (
            <MContext.Consumer>
                {
                    (context) => (
                        <select className={styles.songGroup} name="keyGroups" size={40} onChange={this.change}>
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