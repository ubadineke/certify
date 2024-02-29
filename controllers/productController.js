const cloudinary = require('cloudinary').v2;
const cloud = require('../config/cloudinaryConfig'); //import config
const axios = require('axios');
const User = require('../models/userModel');

exports.generateProject = async (req, res) => {
	try {
		cloud();
		if (!req.file) return res.status(400).json({ Error: 'No file attached' });
		const { name, symbol, description } = req.body;
		const base64EncodedImage = Buffer.from(req.file.buffer).toString('base64');
		const dataUri = `data:${req.file.mimetype};base64,${base64EncodedImage}`;
		const response = await cloudinary.uploader.upload(dataUri);
		const uri = response.url;
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};

		const projectData = {
			name: req.body.name,
			symbol: req.body.symbol,
			description: req.body.description,
			image: uri,
		};
		(async () => {
			const Project = await axios
				.post(`${underdogApiEndpoint}/v2/projects`, projectData, config)
				.catch((error) => {
					console.log(error);
				});
			console.log(Project.data);
			const user = await User.findByIdAndUpdate(
				req.user._id,
				{ $addToSet: { project: Project.data.projectId } },
				{ new: true }
			);
			res.status(200).json(Project.data);
		})();
	} catch (err) {
		res.status(400).json({ Error: 'Not successful, try again!', err });
	}
};


exports.listProjects = async (req, res) => {
	try {
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';
		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};
		const ids = req.user.project;
		let projects = [];
		for (const el of ids) {
			const Project = await axios.get(`${underdogApiEndpoint}/v2/projects/${el}`, config);
			projects.push(Project.data);
		}
		res.status(200).json(projects);
	} catch (err) {
		res.status(400).json({ Error: 'Issues retrieving projects, try again!' });
	}
};

exports.retrieveNft = async (req, res) => {
	try {
		const { project_id, limit, page } = req.body;
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};

		const NFT = await axios.get(
			`${underdogApiEndpoint}/v2/projects/${project_id}?page=${page}&limit=${limit}`,
			config
		);
		res.status(200).json(NFT.data);
	} catch (err) {
		res.status(400).json({ Error: 'Try again, Unsuccesful request' });
	}
};

exports.generateNft = async (req, res) => {
	try {
		cloud();
		if (!req.file) return res.status(400).json({ Error: 'No file attached' });
		const { name, symbol, description } = req.body;
		const base64EncodedImage = Buffer.from(req.file.buffer).toString('base64');
		const dataUri = `data:${req.file.mimetype};base64,${base64EncodedImage}`;
		const response = await cloudinary.uploader.upload(dataUri);
		const uri = response.url;
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};

		const nftData = {
			name: req.body.name,
			symbol: req.body.symbol,
			image: uri,
			receiverAddress: req.user.publicKey,
		};
		(async () => {
			const NFT = await axios.post(
				`${underdogApiEndpoint}/v2/projects/${req.body.project_id}/nfts`,
				nftData,
				config
			);
			res.status(200).json(NFT.data);
		})();
	} catch (err) {
		res.status(400).json({ Error: 'Not successful, try again!' });
	}
};

// exports.retrieveNft = async (req, res) => {
//     try{
//     const {project, limit, page} = req.body
//     const underdogApiEndpoint = "https://devnet.underdogprotocol.com";

//     const config = {
//         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` }
//     };

//  const NFT = await axios.get(
//     `${underdogApiEndpoint}/v2/projects/${project}/nfts?page=${page}&limit=${limit}`, config)
// // console.log(NFT)
// res.status(200).json(NFT.data)
//     }catch(err){
// res.status(400).json({Error: "Not successful, try again!"})
//     }

// }
