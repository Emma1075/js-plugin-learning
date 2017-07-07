# jquery插件或JS原生插件的封装


## Tab 选项卡的插件封装
demo演示地址：http://www.sugar1075.online/js-plugin-learning/tab/tab

自定义参数放在 `data-config` 中。
- `traggerType`: 鼠标触发类型
- `effect`: 内容切换效果
- `invoke`: 默认展示第几个 tab-content
- `auto`: 是否自动切换

### 调用方法
```js
$('.js-tab').tab()

```
### 实现思路
#### 参数设置
将自定义参数写在元素的 `data-config` 中， 为 Tab 定义默认参数 `this.DEFAULT` 与原型方法 `this.getConfig()`。

通过 `$.extend()` 方法得到最终参数。

```js
this.config = $.extend(this.DEFAULT, this.getConfig() || {});

// 原型上的 getConfig 方法
function() {
	let config = this.tab.attr('data-config');
	if (config && config != '') {
		return $.parseJSON(config);
	} else {
		return null;
	}
}
```

#### 初始化

```js
// 原型上的 _init 方法
function () {
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

```

#### 切换状态
先获取当前 tab 的 index 值，通过增加移除 `active` 样式来控制显示。
注意自定义参数 `config.effect` 不同切换效果的变化。

`this.loop` 用于保存当前 `active` 的选项索引，在自动播放时会用到。

```js
// 原型上的 invoke 方法
function (currentTab) {
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
}

```

#### 自动播放
通过 `setInterval()` 方法，实现自动播放。但注意一点，当鼠标在 tab 内时，停止自动播放，保持当前选项卡状态不变。（详见 `_init()` 方法）

```js
// 原型上的 autoPlay 方法
function (time) {
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

```

#### 封装为 jQuery 方法
通过 `$.fn.extend()` 进行封装。最后将 `this` return 出去，方便 jQuery 的链式调用。

```js
$.fn.extend({
	tab: function() {
		this.each(function() {
			new Tab($(this));
		});
		return this;
	}
})


```






