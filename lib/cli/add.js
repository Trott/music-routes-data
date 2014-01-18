module.exports = function (data, collection, _id, names) {
	return data.create(collection, {_id: _id, names: [names]});
};
