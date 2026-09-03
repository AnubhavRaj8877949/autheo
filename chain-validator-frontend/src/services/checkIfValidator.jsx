export async function checkIfValidator(address) {
    const nodeUrl = localStorage.getItem('node');
    let node = nodeUrl && nodeUrl?.split(':');
    const response = await fetch(`${node[0]}:${node[1]}:1317/cosmos/staking/v1beta1/validators/${address}`);
    let result = await response.json();
    return result
}