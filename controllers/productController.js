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
		const Project = await axios
			.post(`${underdogApiEndpoint}/v2/projects`, projectData, config)
			.catch((error) => {
				return res.status(400).json({ error: 'Issue generating project, try again!' });
			});
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ $addToSet: { project: Project.data.projectId } },
			{ new: true }
		);
		res.status(200).json(Project.data);
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
		if (!ids || ids.length == 0) return res.status(404).json({ Error: 'No projects recorded' });
		let projects = [];
		for (const el of ids) {
			const Project = await axios
				.get(`${underdogApiEndpoint}/v2/projects/${el}`, config)
				.catch((err) => {
					return res.status(404).json({ error: 'Project not found' });
				});
			projects.push(Project.data);
		}
		res.status(200).json(projects);
	} catch (err) {
		res.status(400).json({ Error: 'Issues retrieving projects, try again!' });
	}
};

exports.retrieveNfts = async (req, res) => {
	try {
		const { project_id, limit, page } = req.body;
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};

		const NFT = await axios
			.get(
				`${underdogApiEndpoint}/v2/projects/${project_id}?page=${page}&limit=${limit}`,
				config
			)
			.catch((err) => {
				return res.status(404).json({ Error: 'NFT not found' });
			});
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
		const NFT = await axios
			.post(`${underdogApiEndpoint}/v2/projects/${req.body.project_id}/nfts`, nftData, config)
			.catch((err) => {
				return res.status(400).json({ Error: 'Issue Creating NFT, Try again!' });
			});

		res.status(200).json(NFT.data);
	} catch (err) {
		res.status(400).json({ Error: 'Not successful, try again!' });
	}
};

exports.listAllProjects = async (req, res) => {
	try {
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';
		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};
		const projects = await axios
			.get(`${underdogApiEndpoint}/v2/projects/`, config)
			.catch((err) => {
				return res.status(404).json({ Error: 'Project not found' });
			});
		res.status(200).json(projects);
	} catch {
		res.status(400).json({ Error: 'Bad request, try again' });
	}
};

exports.getNft = async (req, res) => {
	try {
		const { project_id, nft_id } = req.body;
		const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';
		const config = {
			headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
		};
		const NFT = await axios
			.get(`${underdogApiEndpoint}/v2/projects/${project_id}/nfts/${nft_id}`, config)
			.catch((err) => {
				return res.status(404).json({ Error: 'NFT not found' });
			});
		res.status(200).json(NFT.data);
	} catch (err) {
		res.status(400).json({ error: 'Unsuccesful request, try again' });
	}
};
