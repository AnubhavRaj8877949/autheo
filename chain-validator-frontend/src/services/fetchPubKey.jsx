/*eslint-disable*/

export default async function fetchPubKey(nodeUrl) {
    let response = await fetch(`${nodeUrl}/status`)
    let result = response.json()
    return result;
};

