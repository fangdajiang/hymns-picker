import React from 'react';
import ReactDOM from 'react-dom/client';
import styles from './index.module.css';
import SongLabels from './SongLabels';
import SongNames from "./SongNames";
import SongPicture from "./SongPicture";

const TOKEN = process.env.REACT_APP_HYMNS_PICKER_TOKEN
const ELASTIC_SEARCH_SUMMARY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/summary';
const PROJECT_API_URL = process.env.REACT_APP_LABEL_STUDIO_DOMAIN + '/api/dm/project';

class Index extends React.Component {
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            elastic_search_total_tasks_count:'?',
            label_studio_total_tasks_count:'?',
            elastic_search_annotated_tasks_count:'?',
            label_studio_annotated_tasks_count:'?',
            token:toString()
        }
    }
    componentDidMount() {
        this.getElasticSearchSummary().then();
        this.getLabelStudioSummary().then();
    }
    async fetchData(url) {
        return fetch(url, {
            headers: {
                'Authorization': `token ${TOKEN}`
            },
            method: 'GET'
        })
            .then(response => response.json())
            .catch(function (error) {
                console.log(error);
            });
    }
    async getElasticSearchSummary() {
        console.log("getting elastic search summary")
        let resp = await this.fetchData(ELASTIC_SEARCH_SUMMARY_API_URL);
        console.log("elastic search total number: " + resp.totalNumber + ", elastic search annotation count: " + resp.annotationCount);
        this.setState({
            elastic_search_total_tasks_count:resp.totalNumber,
            elastic_search_annotated_tasks_count:resp.annotationCount,
        })
    }
    async getLabelStudioSummary() {
        console.log("getting label studio summary")
        let resp = await this.fetchData(PROJECT_API_URL);
        console.log("label studio total number: " + resp.task_count + ", label studio annotation count: " + resp.annotation_count);
        this.setState({
            label_studio_total_tasks_count:resp.task_count,
            label_studio_annotated_tasks_count:resp.annotation_count, //may not accurate
        })
    }
    render() {
        return (
            <div><MyProvider>
                <div>
                    <table className={styles.tbl}>
                        <caption className={styles.caption}>TLBC 三分钟选歌 <font size = "4">(Alpha)</font>
                            【诗歌总数：<span title={"标签库诗歌总数：" + this.state.label_studio_total_tasks_count}>{this.state.elastic_search_total_tasks_count}</span>
                            ，已打标签诗歌：<span title={"标签库已打标签总数：" + this.state.label_studio_annotated_tasks_count}>{this.state.elastic_search_annotated_tasks_count}</span>】
                        </caption>
                        <thead>
                        <tr>
                            <td className={styles.tblHead} colSpan="3">
                                <table className={styles.tbl}>
                                    <tbody>
                                        <tr>
                                            <td className={styles.tdLabels} rowSpan="2">近期歌目</td>
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
                        </thead>
                        <tbody>
                        <tr>
                            <td>过滤标签<br/>（多选按 ⌘ (Win:Ctrl）</td>
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