/* store方法模块 */
define(function () {
	return {
		_store_key: '_sticky_note',
		get: function (id) {
			var notes = this.getNotes();
			return notes[id] || {};
		},
		set: function (id, content) {
			var notes = this.getNotes();
			if (notes[id]) {
				Object.assign(notes[id], content);
			} else {
				notes[id] = content;
			}
			localStorage[this._store_key] = JSON.stringify(notes);
			console.log('set note: id=' + id + ', content=' + JSON.stringify(notes[id]));
		},
		remove: function (id) {
			var notes = this.getNotes();
			delete notes[id];
			localStorage[this._store_key] = JSON.stringify(notes);
			console.log('removed note successfully!')
		},
		/* 获得localStorage中所有的便笺 */
		getNotes: function () {
			console.log('get all note:' + localStorage[this._store_key]);
			return JSON.parse(localStorage[this._store_key] || '{}');
		}
	};
});