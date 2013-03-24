var assert = require('assert'),
	uuid = require('uuid'),
	Stream = require('stream');

module.exports = function(storeType, initializer) {
	var store, roomId;

	describe('storage tests: ' + storeType, function() {
		it('should be able to create a new store', function(done) {
			initializer(null, {}, function(err, createdStore) {
				assert.ifError(err);
				assert(store = createdStore);
				done();
			});
		});

		it('should be able to create a room', function(done) {
			roomId = uuid.v4();

			store.createRoom(roomId, function(err, room) {
				assert.ifError(err);
				assert(room, 'room was not created');
				assert(room instanceof Stream, 'room is not a valid stream');
				assert.equal(room.id, roomId, 'room id does not match specified id');

				done();
			});
		});

		it('should be able to find the room', function(done) {
			store.findRoom(roomId, function(err, room) {
				assert.ifError(err);
				assert(room, 'Could not room that was just created');
				assert.equal(room.id, roomId, 'found room id does not match requested room id');

				done();
			});
		});
	});
};