import React from 'react';
import { createRoot } from 'react-dom/client';
import styles from './index.module.css';
import SongLabels from './SongLabels';
import { fetchData } from './common'

const TOKEN = process.env.REACT_APP_HYMNS_PICKER_TOKEN
const ELASTIC_SEARCH_SUMMARY_API_URL = process.env.REACT_APP_HYMNS_DIGGER_DOMAIN + '/songs/summary';

class Index extends React.Component {
    //构造函数
    constructor(props) {
        super(props);
        //react定义数据
        this.state = {
            elastic_search_total_tasks_count:"?",
            elastic_search_annotated_tasks_count:"?",
            song_summary_annotation_count:"?",
            token:""
        }
    }
    componentDidMount() {
        this.getElasticSearchSummary().then();
    }
    async getElasticSearchSummary() {
        console.log("getting elastic search summary")
        let resp = await fetchData(ELASTIC_SEARCH_SUMMARY_API_URL);
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
                                【诗歌总数：<span>{this.state.elastic_search_total_tasks_count}</span>
                                ，已打标签诗歌：<span>{this.state.elastic_search_annotated_tasks_count}</span>】
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
// ReactDOM.hydrateRoot(
//     document.getElementById('root'),
//     <Index />
// )
// ReactDOM.render(<Index/>, document.getElementById("root"));

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