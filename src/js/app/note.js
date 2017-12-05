/* note对象模块 */
define(['util', 'store'], function (util, store) {
	var $ = util.$,
	    addEventHandler = util.addEventHandler,
	    removeEventHandler = util.removeEventHandler;
	var movedNote = null,
			noteTeml = `<i class="u-close"></i>
		<div class="u-dragger"></div>
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
		this.dragger = $('.u-dragger', note);
		this.updateTime(options.updateTime);
		this.addEvent();	
	}

	/* 为note对象添加maxZIndex属性 */
	Note.prototype.maxZ = {
		maxZIndex: 0
	};

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
			if (parseInt(this.note.style.zIndex) !== this.maxZ.maxZIndex - 1) {
				this.note.style.zIndex = this.maxZ.maxZIndex++;
				store.set(this.note.id, {
					zIndex: this.maxZ.maxZIndex -1
				});
			}
		}.bind(this);
		addEventHandler(this.dragger, 'mousedown', mousedownHandler);
		
		/* 为便笺添加mousemove事件 */
		var mousemoveHandler = function (event) {
			if (!movedNote) {
				return;
			}
			movedNote.style.left = event.clientX - startX + 'px';
			movedNote.style.top = event.clientY - startY + 'px';
		};
		addEventHandler(this.dragger, 'mousemove', mousemoveHandler);
		
		/* 为便笺添加mouseup事件 */
		var mouseupHandler = function (event) {
			store.set(movedNote.id, {
				left: movedNote.offsetLeft,
				top: movedNote.offsetTop
			});
			movedNote = null;
		};
		addEventHandler(this.dragger, 'mouseup', mouseupHandler);

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
	return Note;
});
