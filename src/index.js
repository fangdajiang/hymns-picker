import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './index.module.css';
import SongLabels from './SongLabels';
import SongNames from "./SongNames";
import SongPicture from "./SongPicture";

const TOKEN = process.env.REACT_APP_HYMNS_PICKER_TOKEN

class Index extends React.Component {
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            token:toString()
        }
    }
    componentDidMount() {
    }
    render() {
        return (
            <div><MyProvider>
                <div>
                    <table className={styles.tbl}>
                        <caption><h2>三分钟选歌 (Alpha)</h2></caption>
                        <thead>
                        <tr>
                            <td className={styles.tblHead} colSpan="3">TLBC</td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>过滤</td>
                            <td>诗歌列表</td>
                            <td>谱/歌词/相关经文/作者</td>
                        </tr>
                        <tr>
                            <td className={styles.tdLabels}>
                                <SongLabels token={TOKEN} />
                            </td>
                            <td className={styles.tdNames}>
                                <SongNames token={TOKEN} />
                            </td>
                            <td className={styles.tdPic}>
                                <SongPicture />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </MyProvider></div>
        );
    }
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Index />);

export const MContext = React.createContext();
class MyProvider extends React.Component {
    state = {message: ""}
    render() {
        return (
            <MContext.Provider value={
                {
                    state: this.state,
                    setMessage: (value) =>
                        this.setState(
                            {message: value}
                        )
                    ,
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