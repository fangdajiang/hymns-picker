import React from 'react';
import { hydrateRoot } from 'react-dom/client';
// import ReactDOM from 'react-dom'
import styles from './index.module.css';
import SongLabels from './SongLabels';

const TOKEN = process.env.REACT_APP_HYMNS_PICKER_TOKEN
const ELASTIC_SEARCH_SUMMARY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/summary';

class Index extends React.Component {
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            elastic_search_total_tasks_count:"?",
            song_summary_total_number:"?",
            elastic_search_annotated_tasks_count:"?",
            song_summary_annotation_count:"?",
            token:""
        }
    }
    componentDidMount() {
        this.getElasticSearchSummary().then();
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
    render() {
        return (
            <div><MyProvider>
                <div>
                    <table className={styles.tbl}>
                        <tbody>
                        <tr>
                            <td className={styles.caption}>TLBC 三分钟选歌 <font size = "4">(Beta)</font>
                                【诗歌总数：<span title={"LS诗歌总数：" + this.state.song_summary_total_number}>{this.state.elastic_search_total_tasks_count}</span>
                                ，已打标签诗歌：<span title={"LS已打标签总数：" + this.state.song_summary_annotation_count}>{this.state.elastic_search_annotated_tasks_count}</span>】
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
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(<Index />);
hydrateRoot(
    document.getElementById('root'),
    <Index />
)

export const MContext = React.createContext();
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