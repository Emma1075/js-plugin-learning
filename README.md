# jquery插件或JS原生插件的封装


## Tab 选项卡的插件封装
demo演示地址：http://www.sugar1075.online/js-plugin-learning/tab/tab

自定义参数放在 `data-config` 中。
- `traggerType`: 鼠标触发类型
- `effect`: 内容切换效果
- `invoke`: 默认展示第几个 tab-content
- `auto`: 是否自动切换

### 1. 调用方法
```js
$('.js-tab').tab()

```
### 2. 实现思路
#### 2.1 参数设置
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

#### 2.2 初始化

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

#### 3. 切换状态
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
		this.tabContentItems.removeClass('active');
		this.tabContentItems.fadeOut().eq(index).fadeIn();
		this.tabContentItems.eq(index).addClass('active');
	} else {
		this.tabContentItems.removeClass('active').eq(index).addClass('active');
	}
}

```

#### 4. 自动播放
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

#### 5. 封装为 jQuery 方法
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

#### 6. 一些bug
##### 6.1. 当效果为 `fade` 时，注意改变 `active`样式
```js
// 原写法
if (effect === 'fade') {
	this.tabContentItems.fadeOut().eq(index).fadeIn();
} else {
	this.tabContentItems.removeClass('active').eq(index).addClass('active');
}

// 修复后
if (effect === 'fade') {
	this.tabContentItems.removeClass('active');
	this.tabContentItems.fadeOut().eq(index).fadeIn();
	this.tabContentItems.eq(index).addClass('active');
} else {
	this.tabContentItems.removeClass('active').eq(index).addClass('active');
}
```

如果不这样处理的话，一次遍循环 content 会有闪烁bug。

##### 6.2. 自动播放bug
我们默认当鼠标移到 tab 区域时，停止自动播放（清除计时器），显示当前 content 内容，直到鼠标移出 tab 区域再重新进行自动播放。代码如下：
```js
// 如果鼠标在 tab 上，取消自动播放
if (config.auto) {
	_this.autoPlay(config.auto);

	// 如果鼠标在 tab 上，取消自动播放
	_this.tab.hover(() => {
		window.clearInterval(this.timer);
	}, () => {
		this.autoPlay(config.auto);
	})

}
```

这里产生的 bug 为，如果 `config.triggerType` 为 `mouseover` 且 `config.auto != false` ,自动播放就会有bug。所以修复为：
```js
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

```

6.3. 样式技巧

```
.tab-wrap				// 不设 border
	.tab-nav			// 不设 border
		.tab-nav-item		// 仅设置 border-bottom 
		.tab-nav-item.active 	// 设置 border, 但 border-bottom 为 none
		

	.tab-content 			// 设置 border,但 border-top 为 none
		.tab-content-item
		
```


