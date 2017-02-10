$(function(){
	if($("#header-wrap").size() == 0){
		return false;
	}

	// 预定义变量
	// 左侧开启按钮
	var fixBtn = '<div>'
				+ '<div class="fixed-button" id="appFolder">目录</div>'
				+ '</div>';

	// 是否新页面打开文档
	var openOnNew = parseInt(localStorage.getItem("appFolderOpenNew") || '0');
	// 是否默认展开目录
	var showWrapSetting = parseInt(localStorage.getItem("appFolderShowWrap") || '0');

	setTimeout(function(){
		appendEle();
	}, 500);

	var appFolderWrap = '<div id="appFolderWrap">'
						+ '<div class="app-folder-wrap">'
							+ '<div class="app-folder-list app-folder-list-left">'
							+ '</div>'
							+ '<div class="app-folder-list app-folder-list-center">'
							+ '</div>'
							+ '<div class="app-folder-list app-folder-list-center">'
							+ '</div>'
						+ '</div>'
						+ '<div class="app-folder-close" title="隐藏">'
						+ '</div>'
						+ '<div class="app-folder-setting">'
						+ '新窗口打开：<span class="tg-list-item"><input class="tgl tgl-ios" id="openOnNewSetting" type="checkbox"><label class="tgl-btn" for="openOnNewSetting"></label></span>'
						+ '&nbsp;&nbsp;&nbsp;&nbsp;默认展开：<span class="tg-list-item"><input class="tgl tgl-ios" id="showWrapSetting" type="checkbox"><label class="tgl-btn" for="showWrapSetting"></label></span>'
						+ '</div>'
						+ '</div>';

	$("body").append(appFolderWrap);

	$("#appFolderWrap").css({
		'height': ($(window).height() < 740) ? ($(window).height() * 0.6) : ($(window).height() * 0.5)
	})

	// 配置项初始化
	if(openOnNew){
		$("#appFolderWrap .app-folder-setting #openOnNewSetting").attr("checked", true);
	}else{
		$("#appFolderWrap .app-folder-setting #openOnNewSetting").attr("checked", false);
	}

	if(showWrapSetting){
		$("#appFolderWrap .app-folder-setting #showWrapSetting").attr("checked", true);
	}else{
		$("#appFolderWrap .app-folder-setting #showWrapSetting").attr("checked", false);
	}

	// 获取标星文档
	$.get("https://shimo.im/favorites", function(data){
		var list = data.match(/tempCurrentFile:(.*)\}/);
		if(typeof list[1] == "undefined"){
			return false;
		}
		list = list[1];

		list += '}';
		list = JSON.parse(list);

		var starFileStr = "";

		// 我的桌面在最上方
		starFileStr += '<li class="desktop"><a href="javascript:void(0);" title="我的桌面"><i></i><span>我的桌面</span></a></li>';

		// 分割线
		starFileStr += '<hr style="border-top: 1px solid #e5e5e5;width: 86%;height: 0px;">';

		if(list.children.length > 0){
			for(var i = 0; i < list.children.length; i++){
				var item = list.children[i];
				var docItem = {
					guid: item.guid,
					name: item.name,
					type: item.type,
					is_folder: item.is_folder
				}
				starFileStr += getTemplate(docItem);
			}
		}

		starFileStr = '<ul>'+ starFileStr +'</ul>';

		$("#appFolderWrap .app-folder-list-left").html(starFileStr);
	})

	/* 我的桌面图标点击事件 */
	$("#appFolderWrap .app-folder-list-left").on("click", "li.desktop a", function(){
		var $this = $(this);
		$.get("https://shimo.im/desktop", function(data){
			$this.parent("li").addClass("active").siblings("li").removeClass("active");

			var list = data.match(/tempCurrentFile:(.*)\}/);
			if(typeof list[1] == "undefined"){
				return false;
			}
			list = list[1];

			list += '}';
			list = JSON.parse(list);

			var fileStr = "";

			if(list.children.length > 0){
				for(var i = 0; i < list.children.length; i++){
					var item = list.children[i];
					var docItem = {
						guid: item.guid,
						name: item.name,
						type: item.type,
						is_folder: item.is_folder
					}
					fileStr += getTemplate(docItem);
				}
			}

			fileStr = '<ul>'+ fileStr +'</ul>';

			$("#appFolderWrap .app-folder-list-center").eq(0).html(fileStr);

			clearWrap(0);

		});
	});

	/* 文件夹点击事件 */
	$("#appFolderWrap .app-folder-wrap").on("click", ".app-folder-list li.folder a", function(){
		var folderUrl = $(this).data("url");
		if(!folderUrl){
			return false;
		}
		var $this = $(this);
		var parent = $(this).parent("li").parent("ul").parent(".app-folder-list");

		var folderListNum = $("#appFolderWrap .app-folder-list").size();
		
		if(parent.index() == folderListNum - 1){
			// 是最后一列
			// 追加一列
			var insertWrap = '<div class="app-folder-list app-folder-list-center"></div>';
			$("#appFolderWrap .app-folder-wrap").append(insertWrap);
			// 重新计算宽度
			resizeWrapWidth(folderListNum);
		}else{
			// 不是最后一列
		}

		var target = parent.index();

		$.get(folderUrl, function(data){
			$this.parent("li").addClass("active").siblings("li").removeClass("active");

			var list = data.match(/tempCurrentFile:(.*)\}/);
			if(typeof list[1] == "undefined"){
				return false;
			}
			list = list[1];

			list += '}';
			list = JSON.parse(list);

			var fileStr = "";

			if(list.children.length > 0){
				for(var i = 0; i < list.children.length; i++){
					var item = list.children[i];
					var docItem = {
						guid: item.guid,
						name: item.name,
						type: item.type,
						is_folder: item.is_folder
					}
					fileStr += getTemplate(docItem);
				}
			}

			fileStr = '<ul>'+ fileStr +'</ul>';

			$("#appFolderWrap .app-folder-list-center").eq(target).html(fileStr);

			clearWrap(target);

			// 容器滚动到最右侧
			$("#appFolderWrap").animate({
				'scrollLeft': $("#appFolderWrap .app-folder-wrap").width()
			}, 'slow');

		});
	});

	/* 隐藏按钮 */
	$("#appFolderWrap .app-folder-close").click(function(){
		$("#appFolderWrap").animate({
			'left': '-670px'
		}, 'slow', function(){
			// 显示左侧按钮
			$("#pad-view .fixed-box").toggleClass("active");
		})
	})

	/* 设置新窗口打开 */
	$("#appFolderWrap .app-folder-setting #openOnNewSetting").change(function(){
		openOnNew = $(this).is(":checked") == true ? 1 : 0;
		localStorage.setItem('appFolderOpenNew', openOnNew);
		// 设置链接target属性
		setLinkTarget();
	})

	/* 设置是否默认展开 */
	$("#appFolderWrap .app-folder-setting #showWrapSetting").change(function(){
		showWrapSetting = $(this).is(":checked") == true ? 1 : 0;
		localStorage.setItem('appFolderShowWrap', showWrapSetting);
	})

	function appendEle(){
		if($("#pad-view .fixed-box").size() == 0){
			return false;
		}

		$("#pad-view .fixed-box").eq(0).animate({
			"height": "151px"
		}, 'slow', function(){
			$(this).prepend(fixBtn);

			// 是否默认展开
			if(showWrapSetting > 0){
				setTimeout(function(){
					$("#pad-view .fixed-box #appFolder").trigger('click');
				}, 100);
			}
		});

		// 点击展开
		$("#pad-view .fixed-box").on("click", "#appFolder", function(e){
			$("#appFolderWrap").animate({
				'left': '0px'
			}, 'slow', function(){
				// 隐藏左侧按钮
				$("#pad-view .fixed-box").toggleClass("active");
			})
		});

			
	}

	function getTemplate(item){
		var openOnNewStr = openOnNew > 0 ? ' target="_blank" ' : " ";
		if(item.type == 0){
			return '<li class="doc"><a href="https://shimo.im/doc/'+ item.guid +'" title="'+ item.name +'" '+ openOnNewStr +'><i></i><span>'+ item.name +'</span></a></li>';
		}else if(item.type == -1){
			return '<li class="xls"><a href="https://shimo.im/spreadsheet/'+ item.guid +'" title="'+ item.name +'" '+ openOnNewStr +'><i></i><span>'+ item.name +'</span></a></li>';
		}else if(item.type == 1 || item.is_folder == 1){
			// 文件夹
			return '<li class="folder"><a href="javascript:void(0);" data-url="https://shimo.im/folder/'+ item.guid +'" title="'+ item.name +'"><i></i><span>'+ item.name +'</span></a></li>';
		}else{
			return '';
		}
	}

	/* 重置容器宽度 */
	function resizeWrapWidth(num){
		num = parseInt(num) + 1;
		var width = 140 * num + 20;
		
		$("#appFolderWrap .app-folder-wrap").css({
			'width': width + 'px'
		})
	}

	/* 清空后面的列表 */
	function clearWrap(index){
		index = parseInt(index);
		var wrapSize = $("#appFolderWrap .app-folder-list-center").size();
		for(var i=0; i < wrapSize; i++){
			if(i > index){
				$("#appFolderWrap .app-folder-list-center").eq(i).html('');
				if(i >= 2){
					$("#appFolderWrap .app-folder-list-center").eq(i).remove();
				}
			}
		}
		// 重新计算宽度
		wrapSize = $("#appFolderWrap .app-folder-list-center").size();
		resizeWrapWidth(wrapSize);
	}

	/* 设置链接target属性 */
	function setLinkTarget(){
		openOnNew = openOnNew > 0 ? 1 : 0;
		$("#appFolderWrap ul li a").each(function(index, ele){
			if(ele.href != 'javascript:void(0);'){
				if(openOnNew){
					// 添加target
					ele.target = "_blank";
				}else{
					// 移除target
					ele.target = "";
				}
			}
		});
	}

})