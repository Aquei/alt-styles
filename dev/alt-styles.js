(function(){
	var d = document;
	var doc = (d._currentScript || d.currentScript).ownerDocument;

	var tmpl = doc.querySelector("template");
	var prt = Object.create(HTMLElement.prototype);

	prt.createdCallback = function(){
		var clone = d.importNode(tmpl.content, true);
		var root = this.createShadowRoot();

		this._data = {
			root: root,
		};


		//テンプレートクローンを突っ込む
		this._data.root.appendChild(clone);

		this._setColor();


	}

	prt.changeStyle = function(title){
		if(this._data.titles.indexOf(title) !== -1){
			this._changeGroup(title);
			this._changeSelected(title);
		}
	}

	prt.attachedCallback = function(){
		this._run();
	
		//data-titleがあれば変更する
		if(this.hasAttribute("data-title")){
			this.changeStyle(this.getAttribute("data-title"));
		}

		//設定を読み取る
		if(this.getAttribute("data-site")){
			var setting = this._loadStorage();

			if(setting){
				this.changeStyle(setting.title);
			}
		}
	}

	prt.detachedCallback = function(){
	}

	prt.attributeChangedCallback = function(attrName, oldVal, newVal){
		switch(attrName){
			case "data-color":
				this._setColor();
				break;
			
			case "data-title":
				this.changeStyle(newVal);
				break;
		}
	}

	prt._setColor = function(){
		var color = this.getAttribute("data-color");
		
		if(!color){
			return;
		}

		color = color.toLowerCase();

		var supportedColores = ["dark"];
		
		if(supportedColores.indexOf(color) !== -1){
			var container = this._data.root.querySelector(".alt-styles");

			//reset
			for(var i=0,l=supportedColores.length; i<l; ++i){
				container.classList.remove(supportedColores[i]);
			}

			console.log("color adding, "+color);
			container.classList.add(color);
		}else{
			console.warn("no supported color, "+color);
		}
	}

	prt._getStorageIndex = function(){
		var prefix = this.getAttribute("data-storage-prefix");
		if(!prefix){
			prefix= "";
		}

		var suffix = this.getAttribute("data-storage-suffix");
		if(!suffix){
			suffix = "";
		}
		return  prefix+ "alt-styles" + suffix;
	}

	prt._loadStorage = function(all){
		var site = this.getAttribute("data-site");
		if(!window.localStorage || !site){
			return;
		}

		var storage = localStorage.getItem(this._getStorageIndex());
		if(!storage){
			return;
		}

		var data = JSON.parse(storage);

		if(all){
			return data;
		}

		if(data[site].expire === -1 || data[site].expire >= Date.now()){
			return data[site];
		}
	}

	prt._saveStorage = function(title){
		var site = this.getAttribute("data-site");
		if(!window.localStorage || !site || !title){
			return;
		}

		var data = {
			title: title
		};

		var expire = this.getAttribute("data-expire");

		if(expire === "" || expire === null){
			//デフォルト値は10分
			expire = 1000 * 60 * 10;
		}else{
			expire = parseInt(expire);
		}


		if(expire >= 0 || expire == -1){
			if(expire == -1){
				data.expire = -1;
			}else{
				data.expire = Date.now() + expire;
			}
		}
		
		var all = this._loadStorage(true) || {};

		all[site] = data;

		localStorage.setItem(this._getStorageIndex(), JSON.stringify(all));

		return true;
	}

	prt._changeSelected = function(group){
		//selectedを変更する
		var opt = this._data.root.querySelector("select option[selected]");
		if(opt){
			if(opt.getAttribute("value") == group){
				return;
			}else{
				opt.removeAttribute("selected");
				var gOpt = this._data.root.querySelector('select option[value="'+group+'"]');
				if(gOpt){
					gOpt.setAttribute("selected", "selected");
				}
			}
		}
	}

	prt._run = function(){
		var that = this;
		var titles = [];
		var preferredStyle = d.querySelector('link[rel~="stylesheet"][title][href]:not([rel~="alternate"])');

		var preferredStyleData = preferredStyle.getAttribute('data-style');


		var preferredStyleTitle = preferredStyle.getAttribute("title");

		this._data.currentStyle = preferredStyleTitle;

		titles.push(preferredStyleTitle);


		var alternateStyles = d.querySelectorAll(
				'link[rel~="stylesheet"][rel~="alternate"][title][data-href]'
				+','+
				'link[rel~="stylesheet"][rel~="alternate"][title][href]'
		);
		var select = this._data.root.querySelector("select");

		//優先スタイルシートを追加
		var optPreferredStyle = d.createElement('option');
		optPreferredStyle.setAttribute("selected", "selected");
		optPreferredStyle.setAttribute("value", preferredStyleTitle);
		optPreferredStyle.textContent = preferredStyleTitle;
		if(preferredStyleData){
			optPreferredStyle.setAttribute("style", preferredStyleData);
		}

		select.appendChild(optPreferredStyle);


		//もし代替スタイルシートが存在するならdisabled解除
		if(alternateStyles.length){
			select.removeAttribute("disabled");

			//代替スタイルシートを追加
			for(var i=0,l=alternateStyles.length; i<l; ++i){
				var optAlternateStyle = d.createElement("option");
				var alternateStyleTitle = alternateStyles[i].getAttribute("title");
				var alternateStyleData = alternateStyles[i].getAttribute("data-style");

				if(titles.indexOf(alternateStyleTitle) !== -1){
					continue;
				}else{
					titles.push(alternateStyleTitle);
				}

				optAlternateStyle.setAttribute("value", alternateStyleTitle);
				optAlternateStyle.textContent = alternateStyleTitle;
				
				if(alternateStyleData){
					optAlternateStyle.setAttribute("style", alternateStyleData);
				}

				select.appendChild(optAlternateStyle);
			}
		}


		//変更のイベントリスナ
		select.addEventListener("change", function(e){
			that._changeGroup(e.target.value);

			//ストレージに保存
			that._saveStorage(e.target.value);
		}, false);

		//titleのリストを保存
		this._data.titles = titles;
	}

	prt._changeGroup = function(group){
		if(!group || this._data.currentStyle === group){
			console.warn("empty or already enabled.");
			console.log(this);
			return;
		}

		console.log("changing style to "+group);

		var oldHrefs = [];

		//cloneしたシートを無効化
		var cloned = d.querySelectorAll('link[rel~="stylesheet"][href][data-alt-styles-cloned]');
		for(var i=0,l=cloned.length; i<l; ++i){
			oldHrefs.push(cloned[i].getAttribute("href"));
			//要素を削除
			if(cloned[i].parentNode){
				cloned[i].parentNode.removeChild(cloned[i]);
			}
		}
		

		//groupを探してcloneを挿入
		var groups = d.querySelectorAll(
				'link[rel~="stylesheet"][data-href][title~="'+group+'"]'
				+','+
				'link[rel~="stylesheet"][href][title~="'+group+'"]'
		);
		for(var i=0,l=groups.length; i<l; ++i){
			var lnk = d.createElement('link');
			lnk.setAttribute('href', groups[i].getAttribute('data-href') || groups[i].getAttribute('href'));
			lnk.setAttribute('rel', 'stylesheet');
			lnk.setAttribute('data-alt-styles-cloned', '');
			if(groups[i].hasAttribute('media')){
				lnk.setAttribute('media', groups[i].getAttribute('media'));
			}

			//lnk.setAttribute('title', groups[i].getAttribute('title'));

			var result = groups[i].parentNode.insertBefore(lnk, groups[i].nextSibling);
		}

		var sheets = d.styleSheets;
		for(var i=0,l=sheets.length; i<l; ++i){
			if(sheets[i].title){
				if(sheets[i].title === group){
					//該当するスタイル
					if(sheets[i].disabled){
						//該当するスタイルがdisabledなので有効に
						//追記：chromeだと動かない
						sheets[i].disabled = false;
					}
				}else{
					//該当しないスタイルなのでdisabledに
					if(sheets[i].disabled === false){
						sheets[i].disabled = true;
					}
				}
			}else{
				//不要なシートは無効に
				if(oldHrefs.indexOf(sheets[i].href) !== -1){
					sheets[i].disabled = true;
				}
			}
		}

		//currentstyleを更新
		this._data.currentStyle = group;
	}


	d.registerElement('alt-styles', {prototype:prt});
})();
