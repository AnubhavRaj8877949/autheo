
const getLatestBlocks = async (nodeUrl) => {
    const response = await fetch(`${nodeUrl}/status`)
    const result = await response.json();
    return result;
}

export default getLatestBlocks;
