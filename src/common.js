export function Song(nameCn, labels) {
    this.nameCn = nameCn;
    this.labels = labels;
}
export async function fetchData(url, token) {
    return fetch(url, {
        headers: {
            'Authorization': `token ${token}`
        },
        method: 'GET'
    })
        .then(response => response.json())
        .catch(function (error) {
            console.log(error);
        });
}
export async function getTasks(apiUrl) {
    let songs = []
    let resp = await fetchData(apiUrl);
    if (undefined !== resp) {
        for (let i in resp) {
            songs.push(new Song(resp[i].nameCn, splitLabels(resp[i].labels)))
        }
    } else {
        songs.push(new Song(INVALID_BACKEND, INVALID_BACKEND))
    }
    return songs
}
export function splitLabels(unSplitLabels) {
    let formattedLabels = ""
    unSplitLabels.split(' ').map((label) => {
        formattedLabels += label + "<br/>"
    })
    return formattedLabels
}

export const NOT_AVAILABLE = "(请稍等)"
export const ZERO_RESULTS = "(无结果)"
export const NEED_MORE_WORDS = "(需要更多关键字)"
export const INVALID_BACKEND = "(搜索库故障)"
