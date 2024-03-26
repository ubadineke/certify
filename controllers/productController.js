const cloudinary = require('cloudinary').v2;
const cloud = require('../config/cloudinaryConfig'); //import config
const axios = require('axios');
const User = require('../models/userModel');
const Qr = require('../models/qrModel');
const qr = require('qrcode');
const csvtojson = require('csvtojson');

exports.generateProject = async (req, res) => {
   try {
      cloud();
      if (!req.file) return res.status(400).json({ Error: 'No file attached' });
      const { name, description } = req.body;
      const base64EncodedImage = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64EncodedImage}`;
      const response = await cloudinary.uploader.upload(dataUri);
      const uri = response.url;
      const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

      const config = {
         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
      };

      const projectData = {
         name,
         description,
         image: uri,
      };
      const Project = await axios
         .post(`${underdogApiEndpoint}/v2/projects`, projectData, config)
         .catch((error) => {
            return res.status(400).json({
               error: 'Issue generating project, try again!',
            });
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

exports.getUserProjects = async (req, res) => {
   try {
      const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';
      const config = {
         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
      };
      const ids = req.user.project;
      if (!ids || ids.length === 0) return res.status(404).json({ Error: 'No projects recorded' });
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

exports.getAllProjects = async (req, res) => {
   try {
      const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';
      const config = {
         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
      };
      const projects = await axios
         .get(
            `${underdogApiEndpoint}/v2/projects?page=${req.body.page}&limit=${req.body.limit}`,
            config
         )
         .catch((err) => {
            return res.status(404).json({ Error: 'Project not found' });
         });
      res.status(200).json(projects.data);
   } catch {
      res.status(400).json({ Error: 'Bad request, try again' });
   }
};

exports.getProjectDetails = async (req, res) => {
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

exports.createSingleNft = async (req, res) => {
   try {
      cloud();
      if (!req.file) return res.status(400).json({ Error: 'No file attached' });
      const { name, description } = req.body;
      const base64EncodedImage = Buffer.from(req.file.buffer).toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64EncodedImage}`;
      const response = await cloudinary.uploader.upload(dataUri);
      const uri = response.url;
      const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

      const config = {
         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
      };

      const nftData = {
         name,
         description,
         image: uri,
         receiverAddress: req.user.publicKey,
      };
      const NFT = await axios
         .post(`${underdogApiEndpoint}/v2/projects/${req.body.project_id}/nfts`, nftData, config)
         .catch((err) => {
            return res.status(400).json({
               Error: 'Issue Creating NFT, Try again!',
            });
         });
      const qrCodeDataUri = await qr.toDataURL(JSON.stringify(NFT.data));
      await Qr.create({
         link: qrCodeDataUri,
         nft_id: NFT.data.nftId,
         project_id: NFT.data.projectId,
      });
      res.status(200).json({ qrCode: qrCodeDataUri, details: NFT.data });
   } catch (err) {
      res.status(400).json({ Error: 'Not successful, try again!' });
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
      const [qrCode] = await Qr.find({ project_id, nft_id }).select('link');
      // res.status(200).json(qrCode);
      res.status(200).json({ nft: NFT.data, qr: qrCode });
   } catch (err) {
      res.status(400).json({ error: 'Unsuccesful request, try again' });
   }
};

//Decode CSV with one endpoint, grab the data
exports.generateMultipleNfts = async (req, res) => {
   try {
      //Accept CSV File
      //Transform to JSON
      //Upload the picture, get URI
      //Loop through the JSON and get each serial no.
      //Upload the NFT
      let { project_id } = req.body;
      if (!req.files) return res.status(400).json({ Error: 'No files' });
      if (!req.files.csv) return res.status(404).json({ Error: 'No CSV file attached' });
      if (req.files.csv[0].mimetype !== 'text/csv') {
         return res.status(404).json({ Error: 'Invalid File' });
      }
      const jsonArr = await csvtojson().fromString(req.files.csv[0].buffer.toString());

      if (jsonArr.length != req.body.amount) {
         return res.status(400).json({ Error: 'CSV values do not match the amount stated' });
      }
      cloud();
      const base64EncodedImage = Buffer.from(req.files.image[0].buffer).toString('base64');
      const dataUri = `data:${req.files.image[0].mimetype};base64,${base64EncodedImage}`;
      const response = await cloudinary.uploader.upload(dataUri).catch((err) => {
         return res.status(400).json({ Error: 'Image Upload Error' });
      });
      const uri = response.url;
      const underdogApiEndpoint = 'https://devnet.underdogprotocol.com';

      const config = {
         headers: { Authorization: `Bearer ${process.env.UNDERDOG_TOKEN}` },
      };
      // let isError = false; // Flag variable to track error

      const nftCreatePromises = jsonArr.map(async (obj) => {
         // if (isError == true) return;
         const nftData = {
            name: req.body.name,
            description: obj.SN,
            image: uri,
            receiverAddress: req.user.publicKey,
         };
         // console.log(nftData);
         const NFT = await axios.post(
            `${underdogApiEndpoint}/v2/projects/${project_id}/nfts`,
            nftData,
            config
         );
         const qrCodeDataUri = await qr.toDataURL(JSON.stringify(NFT.data));
         await Qr.create({
            link: qrCodeDataUri,
            nft_id: NFT.data.nftId,
            project_id: NFT.data.projectId,
         });
         return NFT;
      });
      const createdNFTs = await Promise.all(nftCreatePromises);

      res.status(200).json({
         message: `${createdNFTs.length} NFTs successfully created`,
      });
   } catch (err) {
      return res.status(400).json({ error: err.message || 'Issues generating NFT, Try again' });
   }
};
