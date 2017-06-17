/* 名字空间模块 */
var app = {
	util: {},
	store: {}
};
/* 工具方法模块 */
app.util = {
	$: function (selector, node) {
		return (node || document).querySelector(selector);
	},
	$$: function (selector,node) {
		return (node || document).querySelectorAll(selector);
	},
	formatTime: function (ms) {
		var time = new Date(ms);
		function pad(num) {
			return (num > 9) ? num : ('0' + num);
		}
		var year = time.getFullYear();
		var month = time.getMonth() + 1;
		var date = time.getDate();
		var hour = time.getHours();
		var minute = time.getMinutes();
		var second = time.getSeconds();
		return year + '-' + pad(month) + '-' + pad(date) + ' ' + pad(hour) + ':' + pad(minute) + ':' + pad(second);
	},
	addEventHandler: function (node, event, handler) {
		        	if (!!node.addEventListener) {
		        	    node.addEventListener(event, handler, false);
		        	} else if (!!node.attachEvent) {
		        	    node.attachEvent('on'+event, handler);
		        	} else {
		        		node['on' + event] = handler;
		        	}
		      },
	removeEventHandler: function (node, event, handler) {
		        	if (!!node.removeEventListener) {
		        	    node.addEventListener(event, handler, false);
		        	} else if (!!node.detachEvent) {
		        	    node.attachEvent('on'+event, handler);
		        	} else {
		        		node['on' + event] = null;
		        	}
		      }
};

/* store方法模块 */
app.store = {
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

(function (util, store) {
	var $ = util.$,
 	    addEventHandler = util.addEventHandler,
 	    removeEventHandler = util.removeEventHandler,
 	    movedNote = null,
		notesAry = [],
 	    startX, startY,
 	    maxZIndex = 0,
 	    noteTeml = `<i class="u-close"></i>
			<div class="u-editor" contenteditable="true"></div>
			<div class="u-timestamp">
				<span>更新：</span>
				<span class="time"></span>
			</div>`;
	/* 创建note对象的构造函数 */
	function Note(options) {
		var note = document.createElement('div');
		note.className = 'm-note';
		note.id = options.id || 'm-note-' + Date.now();
		note.innerHTML = noteTeml;
		note.style.left = options.left + 'px';
		note.style.top = options.top + 'px';
		note.style.zIndex = options.zIndex;
		$('.u-editor', note).innerHTML = options.content || '';
		document.body.appendChild(note);
		this.note = note;
		this.updateTime(options.updateTime);
		this.addEvent();	
	}

	/* 为note对象添加关闭方法 */
	Note.prototype.close = function (event) {
		console.log('closed note successfully!');
		document.body.removeChild(this.note);
	};

	/* 为note对象添加更新时间方法 */
	Note.prototype.updateTime = function (ms) {
		var ts = $('.time', this.note);
		ms = ms || Date.now();
		ts.innerHTML = util.formatTime(ms);
		this.updateTimeByMs = ms;
	};

	/* 为note对象添加保存方法 */
	Note.prototype.save = function () {
		store.set(this.note.id, {
			left: this.note.offsetLeft,
			top: this.note.offsetTop,
			zIndex: parseInt(this.note.style.zIndex),
			content: $('.u-editor', this.note).innerHTML || '',
			updateTime: this.updateTimeByMs
		});
	};

	/* 为note对象添加增添事件方法 */
	Note.prototype.addEvent = function () {
		/* 为便笺添加mousedown事件 */
		var mousedownHandler = function (event) {
			movedNote = this.note;
			startX = event.clientX - this.note.offsetLeft;
			startY = event.clientY - this.note.offsetTop;
			if (parseInt(this.note.style.zIndex) !== maxZIndex - 1) {
				this.note.style.zIndex = maxZIndex++;
				store.set(this.note.id, {
					zIndex: maxZIndex -1
				});
			}
		}.bind(this);
		addEventHandler(this.note, 'mousedown', mousedownHandler);
		
		/* 为便笺添加mousemove事件 */
		var mousemoveHandler = function (event) {
			if (!movedNote) {
				return;
			}
			movedNote.style.left = event.clientX - startX + 'px';
			movedNote.style.top = event.clientY - startY + 'px';
		};
		addEventHandler(this.note, 'mousemove', mousemoveHandler);
		
		/* 为便笺添加mouseup事件 */
		var mouseupHandler = function (event) {
			store.set(movedNote.id, {
				left: movedNote.offsetLeft,
				top: movedNote.offsetTop
			});
			movedNote = null;
		};
		addEventHandler(this.note, 'mouseup', mouseupHandler);

		/* 为便笺添加input事件 */
		var editor = $('.u-editor', this.note);
		var inputTimer;
		var inputHandler = function (event) {		
			clearTimeout(inputTimer);
			inputTimer = setTimeout(function () {
				var time = Date.now();
				var content = editor.innerHTML;
				this.updateTime(time);
				store.set(this.note.id, {
					content: content,
					updateTime: time
				});
			}.bind(this), 2000);
		}.bind(this);
		addEventHandler(editor, 'input', inputHandler);

		/* 为便笺的关闭按钮添加点击事件 */
		var closeBtn = $('.u-close', this.note);
		var closeHandler = function (event) {
			this.close(event);
			store.remove(this.note.id);
			removeEventHandler(closeBtn, 'click', closeHandler);
			removeEventHandler(this.note, 'mousedown', mousedownHandler);
			removeEventHandler(this.note, 'mousemove', mousemoveHandler);
			removeEventHandler(this.note, 'mouseup', mouseupHandler);
			removeEventHandler(this.note, 'input', inputHandler);
			console.log('closed note successfully');
		}.bind(this);
		addEventHandler(closeBtn, 'click', closeHandler);
	};
	
	/* 为文档加载完添加事件 */
	addEventHandler(document, 'DOMContentLoaded', function (event) {
		/* 为创建按钮添加点击事件 */
		addEventHandler($('#create'), 'click', function (event) {
			var note = new Note({
				left: Math.floor(Math.random() * (window.innerWidth - 220)),
        		top: Math.floor(Math.random() * (window.innerHeight - 365)) + 45,
        		zIndex: maxZIndex++
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
			if (maxZIndex < content.zIndex) {
				maxZIndex = content.zIndex;
			}
			var note = new Note(Object.assign(content, { id: id }));
			notesAry.push(note);
		});
		maxZIndex += 1;
	});
})(app.util, app.store);
