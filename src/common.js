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
export const NOT_AVAILABLE = "(请稍等)"
export const ZERO_RESULTS = "(无结果)"
export const INVALID_BACKEND = "(搜索库故障)"
