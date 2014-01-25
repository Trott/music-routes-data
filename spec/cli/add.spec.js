// Specs are run via Grunt: grunt jasmine_node

var add = require("../../lib/cli/add");

describe ("cli/add", function () {
	it("should call data.create with collection and an object containing id and name array", function () {
		var testDouble = {create: function () {}};
		spyOn(testDouble, "create");
		add(testDouble, "foo", "bar", "baz");
		expect(testDouble.create).toHaveBeenCalledWith("foo", {_id: "bar", names: ["baz"]});
	});
});
