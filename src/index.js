import React from 'react';
import { createRoot } from 'react-dom/client';
import styles from './index.module.css';
import SongLabels from './SongLabels';

const TOKEN = process.env.REACT_APP_HYMNS_PICKER_TOKEN

class Index extends React.Component {
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            token:""
        }
    }
    componentDidMount() {
    }
    render() {
        return (
            <div><MyProvider>
                <div>
                    <table className={styles.tbl}>
                        <tbody>
                        <tr>
                            <td className={styles.caption}>
                                TLBC 三分钟选歌 <font size = "4">(v0.6.0)</font>
                            </td>
                        </tr>
                        <tr>
                            <td className={styles.tblHead} colSpan="3">
                                <table className={styles.tbl}>
                                    <tbody>
                                        <tr>
                                            <td className={styles.tdReview} rowSpan="2">近期歌目</td>
                                            <td>10月</td>
                                            <td>11月</td>
                                            <td>12月</td>
                                            <td>1月</td>
                                        </tr>
                                        <tr>
                                            <td>1</td>
                                            <td>2</td>
                                            <td>3</td>
                                            <td>4</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className={styles.tdLabels} colSpan="3">
                                <SongLabels token={TOKEN} />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </MyProvider></div>
        );
    }
}
const root = createRoot(document.getElementById("root"));
root.render(<Index />);

export const MContext = React.createContext(null);
class MyProvider extends React.Component {
    state = {message: ""}
    render() {
        return (
            <MContext.Provider value={
                {
                    state: this.state,
                    setImage: (resized, original, txt) =>
                        this.setState(
                            {
                                resizedUrl: resized,
                                originalUrl: original,
                                alt: txt
                            }
                        )
                }
            }>
                {this.props.children}
            </MContext.Provider>)
    }
}