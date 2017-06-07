"use strict";function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),TabsToAccordion=function(){function t(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};_classCallCheck(this,t),this.defaults={defaultTab:0,tabContentClass:"TabsAccordion-content",tabTitleClass:"TabsAccordion-title",tabNavClass:"TabsNavigation"},this.options=Object.assign(this.defaults,n),this.element=e,this.element.classList.add("Tabs--init"),this.currentTab=null,this.tabContentElements=[].slice.call(this.element.querySelectorAll("."+this.options.tabContentClass)),this.fetchTabData(),this.accordion=this.element.querySelector(".TabsAccordion"),this.accordion.setAttribute("role","tablist"),this.bindAccordionEvents(),this.tabNavElement=this.element.querySelector("."+this.options.tabNavClass),this.tabNavItems=[].slice.call(this.tabNavElement.querySelectorAll("a")),this.element.classList.add("Tabs--nav-init"),this.bindNavEvents();var i=this.tabContentElements[this.options.defaultTab];this.openTab(i)}return _createClass(t,[{key:"fetchTabData",value:function(){this.tabData=[];for(var t=void 0,e=void 0,n=void 0,i=0;i<this.tabContentElements.length;i++)e=(t=this.tabContentElements[i]).previousElementSibling,n={tabId:t.id,tabTitle:e.innerText},this.tabData.push(n),t.setAttribute("role","tabpanel"),t.setAttribute("aria-hidden","true"),e.setAttribute("role","tab"),e.setAttribute("aria-controls",n.tabId),e.setAttribute("aria-selected","false"),e.setAttribute("aria-expanded","false")}},{key:"bindAccordionEvents",value:function(){for(var t=this.accordion.querySelectorAll("."+this.options.tabTitleClass),e=0;e<t.length;e++)t[e].addEventListener("click",this.onTitleClick.bind(this)),t[e].addEventListener("keydown",this.onTitleKeydown.bind(this))}},{key:"onTitleClick",value:function(t){t.preventDefault();var e=t.currentTarget.nextElementSibling;this.handleAccordion(e)}},{key:"onTitleKeydown",value:function(t){var e=this.handleKeyPress(t);null!==e&&this.handleAccordion(this.tabContentElements[e])}},{key:"handleKeyPress",value:function(t){var e=this.currentTab.position,n={SPACE:32,ENTER:13};switch(t.keyCode){case n.SPACE:case n.ENTER:e=this.handleEnter(e);break;default:e=null}return e}},{key:"handleEnter",value:function(t){var e=document.getElementById(document.activeElement.getAttribute("aria-controls"));return e!==this.currentTab.contentElement&&(t=this.tabContentElements.indexOf(e)),t}},{key:"handleAccordion",value:function(t){this.isCurrentTab(t)||this.openAccordion(t)}},{key:"isCurrentTab",value:function(t){return this.currentTab.contentElement===t}},{key:"openAccordion",value:function(t){this.closeTab(),this.openTab(t),this.currentTab.titleElement.focus()}},{key:"bindNavEvents",value:function(){for(var t=0;t<this.tabNavItems.length;t++)this.tabNavItems[t].addEventListener("click",this.onTabClick.bind(this))}},{key:"onTabClick",value:function(t){t.preventDefault();var e=this.element.querySelector(t.currentTarget.hash);this.isCurrentTab(e)||(this.closeTab(),this.openTab(e))}},{key:"closeTab",value:function(){this.currentTab.contentElement.setAttribute("aria-hidden","true"),this.currentTab.titleElement.setAttribute("aria-selected","false"),this.currentTab.titleElement.setAttribute("aria-expanded","false"),this.tabNavItems[this.currentTab.position].setAttribute("aria-selected","false"),this.tabNavItems[this.currentTab.position].setAttribute("aria-expanded","false"),this.currentTab=null}},{key:"openTab",value:function(t){this.currentTab={contentElement:t,titleElement:t.previousElementSibling,position:this.tabContentElements.indexOf(t)},t.setAttribute("aria-hidden","false"),this.currentTab.titleElement.setAttribute("aria-selected","true"),this.currentTab.titleElement.setAttribute("aria-expanded","true"),this.updateTabNav()}},{key:"updateTabNav",value:function(){var t=this.tabNavItems[this.currentTab.position];t.setAttribute("aria-selected","true"),t.setAttribute("aria-expanded","true")}}]),t}();window.TabsToAccordion=TabsToAccordion;