import axios from 'axios';

const underdogApiEndpoint = "https://devnet.underdogprotocol.com";
const token = '44503228eaef4f.ee3e0ba5a29f4169af945f1891bdf4a7'

const config = {
    headers: { Authorization: `Bearer ${token}` }
};
(async() => {
const projectData = { 
    "name": "UChika Project", 
    "symbol": "UP", 
    "image": "https://res.cloudinary.com/dufy5hiis/image/upload/v1709049308/c0f8ba185db581d6f312d860f8004257_fixkxu.png", 
  };

  
const ProjectResponse  = await axios.post(`${underdogApiEndpoint}/v2/projects`, projectData, config,
  );
console.log(ProjectResponse.data)
})();

  const nftData = { 
    "name": "CHekcamdu #1", 
    "symbol": "UP", 
    "image": "https://res.cloudinary.com/dufy5hiis/image/upload/v1709049152/ap_hen_rescue_1_krbzip.jpg", 
    "receiverAddress": "9uTxzRVDF7KJ8jigwKZXCGs4MCKgaStWVEJqHNAiA5cn"
  };
  
//   const createNftResponse = await axios.post(
//     `${underdogApiEndpoint}/v2/projects/3/nfts`, nftData, config,

// );
// console.log(createNftResponse.data);


//  const retrieveNFT = await axios.get(
//     `${underdogApiEndpoint}/v2/projects/3/nfts/6`, config)   
// console.log(retrieveNFT)

