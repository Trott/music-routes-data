module.exports = function (data, collection1, id1, collection2, id2) {

  var linkCollection = collection1 + '_' + collection2;
  var field1 = collection1 + '_id';
  var field2 = collection2 + '_id';
  var link = {};
  link[field1] = id1.toString();
  link[field2] = id2.toString();

  if (data.linkCollections.indexOf(linkCollection) === -1) {
    // Try track_release if release_track is what we have
    linkCollection = collection2 + '_' + collection1;
    if (data.linkCollections.indexOf(linkCollection) === -1) {
      this.error(collection1 + " and " + collection2 + " cannot be linked");
      return {status: data.StatusEnum.ERROR};
    }
  }
  return data.link(linkCollection, link);
};
