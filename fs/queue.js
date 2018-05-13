// From https://github.com/germancutraro/Queue-Data-Structure/

let Queue	= {
	create: function() {
	  this.data = [];
	},

	add: function(record) {
	  this.data.push(record);
	},

	remove: function() {
	  this.data.splice(0,1);
	},

	first: function() {
	  return this.data[0];
	},

	last: function() {
	  return this.data[this.data.length - 1];
	},

	size: function() {
	  return this.data.length;
	},

	isEmpty: function() {
		return this.data.length === 0
	}
}
