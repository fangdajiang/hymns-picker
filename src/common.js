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
    let songNames = ""
    let resp = await fetchData(apiUrl);
    if (undefined !== resp) {
        for (let i in resp) {
            // console.log("song name:'" + resp[i].nameCn + "'")
            songNames += resp[i].nameCn + ","
        }
    } else {
        songNames = INVALID_BACKEND
    }
    return songNames
}

export const NOT_AVAILABLE = "(请稍等)"
export const ZERO_RESULTS = "(无结果)"
export const NEED_MORE_WORDS = "(需要更多关键字)"
export const INVALID_BACKEND = "(搜索库故障)"
