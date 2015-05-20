!function(){var t=document,e=(t._currentScript||t.currentScript).ownerDocument,r=e.querySelector("template"),a=Object.create(HTMLElement.prototype);a.createdCallback=function(){var e=t.importNode(r.content,!0),a=this.createShadowRoot();this._data={root:a},this._data.root.appendChild(e),this._setColor()},a.changeStyle=function(t){-1!==this._data.titles.indexOf(t)&&(this._changeGroup(t),this._changeSelected(t))},a.attachedCallback=function(){if(this._run(),this.hasAttribute("data-title")&&this.changeStyle(this.getAttribute("data-title")),this.getAttribute("data-site")){var t=this._loadStorage();t&&this.changeStyle(t.title)}},a.detachedCallback=function(){},a.attributeChangedCallback=function(t,e,r){switch(t){case"data-color":this._setColor();break;case"data-title":this.changeStyle(r)}},a._setColor=function(){var t=this.getAttribute("data-color");if(t){t=t.toLowerCase();var e=["dark"];if(-1!==e.indexOf(t)){for(var r=this._data.root.querySelector(".alt-styles"),a=0,l=e.length;l>a;++a)r.classList.remove(e[a]);console.log("color adding, "+t),r.classList.add(t)}else console.warn("no supported color, "+t)}},a._getStorageIndex=function(){var t=this.getAttribute("data-storage-prefix");t||(t="");var e=this.getAttribute("data-storage-suffix");return e||(e=""),t+"alt-styles"+e},a._loadStorage=function(t){var e=this.getAttribute("data-site");if(window.localStorage&&e){var r=localStorage.getItem(this._getStorageIndex());if(r){var a=JSON.parse(r);return t?a:-1===a[e].expire||a[e].expire>=Date.now()?a[e]:void 0}}},a._saveStorage=function(t){var e=this.getAttribute("data-site");if(window.localStorage&&e&&t){var r={title:t},a=this.getAttribute("data-expire");a=""===a||null===a?6e5:parseInt(a),(a>=0||-1==a)&&(r.expire=-1==a?-1:Date.now()+a);var l=this._loadStorage(!0)||{};return l[e]=r,localStorage.setItem(this._getStorageIndex(),JSON.stringify(l)),!0}},a._changeSelected=function(t){var e=this._data.root.querySelector("select option[selected]");if(e){if(e.getAttribute("value")==t)return;e.removeAttribute("selected");var r=this._data.root.querySelector('select option[value="'+t+'"]');r&&r.setAttribute("selected","selected")}},a._run=function(){var e=this,r=[],a=t.querySelector('link[rel~="stylesheet"][title][href]:not([rel~="alternate"])'),l=a.getAttribute("data-style"),i=a.getAttribute("title");this._data.currentStyle=i,r.push(i);var o=t.querySelectorAll('link[rel~="stylesheet"][rel~="alternate"][title][data-href],link[rel~="stylesheet"][rel~="alternate"][title][href]'),s=this._data.root.querySelector("select"),n=t.createElement("option");if(n.setAttribute("selected","selected"),n.setAttribute("value",i),n.textContent=i,l&&n.setAttribute("style",l),s.appendChild(n),o.length){s.removeAttribute("disabled");for(var d=0,c=o.length;c>d;++d){var h=t.createElement("option"),u=o[d].getAttribute("title"),g=o[d].getAttribute("data-style");-1===r.indexOf(u)&&(r.push(u),h.setAttribute("value",u),h.textContent=u,g&&h.setAttribute("style",g),s.appendChild(h))}}s.addEventListener("change",function(t){e._changeGroup(t.target.value),e._saveStorage(t.target.value)},!1),this._data.titles=r},a._changeGroup=function(e){if(!e||this._data.currentStyle===e)return console.warn("empty or already enabled."),void console.log(this);console.log("changing style to "+e);for(var r=[],a=t.querySelectorAll('link[rel~="stylesheet"][href][data-alt-styles-cloned]'),l=0,i=a.length;i>l;++l)r.push(a[l].getAttribute("href")),a[l].parentNode&&a[l].parentNode.removeChild(a[l]);for(var o=t.querySelectorAll('link[rel~="stylesheet"][data-href][title~="'+e+'"],link[rel~="stylesheet"][href][title~="'+e+'"]'),l=0,i=o.length;i>l;++l){var s=t.createElement("link");s.setAttribute("href",o[l].getAttribute("data-href")||o[l].getAttribute("href")),s.setAttribute("rel","stylesheet"),s.setAttribute("data-alt-styles-cloned",""),o[l].hasAttribute("media")&&s.setAttribute("media",o[l].getAttribute("media"));{o[l].parentNode.insertBefore(s,o[l].nextSibling)}}for(var n=t.styleSheets,l=0,i=n.length;i>l;++l)n[l].title?n[l].title===e?n[l].disabled&&(n[l].disabled=!1):n[l].disabled===!1&&(n[l].disabled=!0):-1!==r.indexOf(n[l].href)&&(n[l].disabled=!0);this._data.currentStyle=e},t.registerElement("alt-styles",{prototype:a})}();