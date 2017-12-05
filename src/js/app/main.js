/* 主模块 */
define(['util', 'store', 'note'], function (util, store, Note) {
	var $ = util.$,
	    addEventHandler = util.addEventHandler,
	    removeEventHandler = util.removeEventHandler,
			notesAry = [],
	    startX, startY,
	    maxZ = Note.prototype.maxZ;
	/* 为文档加载完添加事件 */
	// addEventHandler(window, 'load', function (event) {
		/* 为创建按钮添加点击事件 */
		addEventHandler($('#create'), 'click', function (event) {
			var note = new Note({
				left: Math.floor(Math.random() * (window.innerWidth - 220)),
        top: Math.floor(Math.random() * (window.innerHeight - 365)) + 45,
        zIndex: maxZ.maxZIndex++
			});
			note.save();
			notesAry.push(note);
		});
		/* 为清空按钮添加点击事件，此处还没有解决在低版本浏览器中为节点移除事件的兼容性问题*/
		addEventHandler($('#clear'), 'click', function (event) {
			for (var i = 0, len = notesAry.length; i < len; i++) {
					var noteAry = notesAry[i];
					var closeBtn = $('.u-close', noteAry.note);
					noteAry.close(event);
					store.remove(noteAry.note.id);
					console.log('closed all notes successfully!');
			}
			notesAry = [];
		});

		/* 初始化所有便笺 */
		var notes = store.getNotes();
		Object.keys(notes).forEach(function (id) {
			var content = notes[id];
			if (maxZ.maxZIndex < content.zIndex) {
				maxZ.maxZIndex = content.zIndex;
			}
			var note = new Note(Object.assign(content, { id: id }));
			notesAry.push(note);
		});
		maxZ.maxZIndex += 1;
	// });
});
