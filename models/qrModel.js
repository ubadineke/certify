const mongoose = require('mongoose');
const qrSchema = new mongoose.Schema(
	{
		link: {
			type: String,
			required: [true, 'Provide qrcode link'],
		},
		nft_id: {
			type: String,
			required: [true, 'Provide nft_id'],
		},
		project_id: {
			type: String,
			required: [true, 'Provide project_id'],
		},
	},
	{
		timestamps: true,
	}
);

const Qr = mongoose.model('Qr', qrSchema);

module.exports = Qr;
