;(function($,window,document,undefined){
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
			'effect': 'default',
			'invoke': 0,
			'auto': false
		};

		this.options = $.extend({},this.DEFAULT, this.getConfig());

		// 获取标签 与 内容
		this.tabItems = this.tab.find('.tab-nav li');
		this.tabContentItems = this.tab.find('.tab-content .tab-content-item');

		// 设置计时器
		this.timer = null;
		this.loopIndex = 0;

		this._init();
	}

	Tab.prototype = {
		_init() {
			let _this = this,
				config = this.options;
			
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

					if (config.triggerType == 'click') {
						// 如果鼠标在 tab 上，取消自动播放
						_this.tab.hover(() => {
							window.clearInterval(this.timer);
						}, () => {
							this.autoPlay(config.auto);
						})
					}
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
				effect = this.options.effect;
			this.loopIndex = index;
			this.tabItems.removeClass('active').eq(index).addClass('active');
			this.tabContentItems.removeClass('active').eq(index).addClass('active');

			if (effect === 'fade') {
				this.tabContentItems.removeClass('active');
				this.tabContentItems.fadeOut().eq(index).fadeIn();
				this.tabContentItems.eq(index).addClass('active');
			} else {
				this.tabContentItems.removeClass('active').eq(index).addClass('active');
			}
		},

		// 自动切换
		autoPlay(time) {
			let _this = this,
				config = this.options;
				tabItems = this.tabItems,
				length = tabItems.length;

			this.timer = window.setInterval(function(){
				_this.loopIndex++;
				console.log(`loop: ${_this.loopIndex}`);
				if (_this.loopIndex >= length) {
					_this.loopIndex = 0;
				}
				tabItems.eq(_this.loopIndex).trigger(config.triggerType);
			}, time)

		}
		
	};

	Tab.init = function(tabs) {
		let _this = this;
		tabs.each(function() {
			new _this($(this));
		})
	}

	// 注册为 jQuery 方法
	$.fn.extend({
		tab: function() {
			this.each(function() {
				new Tab($(this));
			});
			return this;
		}
	})

})(jQuery,window,document)

