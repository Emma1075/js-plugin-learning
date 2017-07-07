;(function($){
	let Tab = function(tab) {
	 	this.tab = tab;

		/** 配置默认参数
		 * @ traggerType: 鼠标触发类型
		 * @ effect: 内容切换效果
		 * @ invoke: 默认展示第几个 tab-content
		 * @ auto: 是否自动切换
		*/
		this.DEFAULT = {
			'triggerType':'click',
			'effect': 'config',
			'invoke': 1,
			'auto': false
		};

		this.config = $.extend(this.DEFAULT, this.getConfig() || {});

		// 标签 与 内容
		this.tabItems = this.tab.find('.tab-nav li');
		this.tabContentItems = this.tab.find('.tab-content .tab-content-item');

		// 计时器
		this.timer = null;
		this.loop = 0;

		this._init();
	}

	Tab.prototype = {
		_init() {
			let _this = this,
				config = this.config;
			
			if (config) {

				// 切换效果的实现
				if (config.triggerType == 'click') {
					_this.tabItems.bind(config.triggerType, function() {
						_this.invoke($(this));
					}) 
				} else {
					_this.tabItems.bind('mouseover', function() {
						_this.invoke($(this));	
					})		
				};

				// 自动播放的实现
				if (config.auto) {
					_this.autoPlay(config.auto);

					// 如果鼠标在 tab 上，取消自动播放
					_this.tab.hover(() => {
						window.clearInterval(this.timer);
					}, () => {
						this.autoPlay(config.auto);
					})
				}

				// 设置默认显示第几个tab
				if (config.invoke != 1) {
					let currentTab = _this.tabItems.eq(config.invoke - 1);
					_this.invoke(currentTab);
				}

			}

		},

		// 获取配置参数
		getConfig() {
			let config = this.tab.attr('data-config');
			if (config && config != '') {
				return $.parseJSON(config);
			} else {
				return null;
			}
		},

		// 唤醒函数
		invoke(currentTab) {
			let index = currentTab.index(),
				effect = this.config.effect;
			this.loop = index;
			this.tabItems.removeClass('active').eq(index).addClass('active');
			this.tabContentItems.removeClass('active').eq(index).addClass('active');

			if (effect === 'fade') {
				this.tabContentItems.fadeOut().eq(index).fadeIn();	
			} else {
				this.tabContentItems.removeClass('active').eq(index).addClass('active');
			}
		},

		// 自动切换
		autoPlay(time) {
			let _this = this,
				config = this.config;
				tabItems = this.tabItems,
				length = tabItems.length;

			this.timer = window.setInterval(function(){
				_this.loop++;
				if (_this.loop >= length) {
					_this.loop = 0;
				}
				tabItems.eq(_this.loop).trigger(config.triggerType);
			}, time)

		}
		
	}

	$.fn.extend({
		tab: function() {
			this.each(function() {
				new Tab($(this));
			});
			return this;
		}
	})


	window.Tab = Tab;
})(jQuery)

