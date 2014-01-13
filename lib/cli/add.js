module.exports = function (data, outputDir, collection, _id, names) {
	return data.create(collection, {_id: _id, names: [names]});
};