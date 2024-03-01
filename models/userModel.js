const mongoose = require('mongoose');
const validator = require('validator');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please input your fullname'],
		},
		email: {
			type: String,
			required: [true, 'Please provide an email address'],
			unique: true,
			validate: [validator.isEmail, 'Please provide a valid email'],
		},
		password: {
			type: String,
			required: [true, 'Please provide a password'],
			minlength: 8,
			select: false,
		},
		publicKey: {
			type: String,
			required: [true, 'Private key must be generated'],
		},
		secretKey: {
			type: Array,
			required: [true, 'Private key must be generated'],
			select: false,
		},
		project: {
			type: Array,
		},
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
	},
	{
		timestamps: true,
	}
);

//Hash Password
userSchema.pre('save', async function (next) {
	//ONly run this function if password was actually modified
	if (!this.isModified('password')) return next();

	//Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	next();
});

//Compare password
userSchema.methods.correctPassword = async function (incomingPassword, storedPassword) {
	return await bcrypt.compare(incomingPassword, storedPassword);
};

userSchema.plugin(uniqueValidator);
const User = mongoose.model('User', userSchema);

module.exports = User;
