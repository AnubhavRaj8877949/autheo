export async function getUnjailingTime() {
    const nodeUrl = localStorage.getItem('node');
    let node = nodeUrl && nodeUrl?.split(':');
    const response = await fetch(`${node[0]}:${node[1]}:1317/cosmos/slashing/v1beta1/params`);
    let result = await response.json();
    return result
}