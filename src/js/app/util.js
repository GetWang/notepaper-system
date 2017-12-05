/* 工具方法模块 */
define(function () {
	return {
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
});