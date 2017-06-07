'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TabsToAccordion = function () {
    function TabsToAccordion(element) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, TabsToAccordion);

        // define default options for this component instance
        this.defaults = {
            defaultTab: 0,
            tabContentClass: 'TabsAccordion-content',
            tabTitleClass: 'TabsAccordion-title',
            tabNavClass: 'TabsNavigation'
            // merge defaults with any options passed through the constructor
        };this.options = Object.assign(this.defaults, options

        // store the main DOM element and add the init class used to
        // handle styling of accordion states
        );this.element = element;
        this.element.classList.add('Tabs--init'

        // which tab is currently open/active
        );this.currentTab = null;

        // store all the tab content containers so they can be referenced later
        // for state changes
        this.tabContentElements = [].slice.call(this.element.querySelectorAll('.' + this.options.tabContentClass));

        this.fetchTabData

        // store the accordion container (smaller screens)
        // and apply appropriate ARIA attribute
        ();this.accordion = this.element.querySelector('.TabsAccordion');
        this.accordion.setAttribute('role', 'tablist'

        // handle events for accordion/smaller screens
        );this.bindAccordionEvents

        // get the tab container (larger screens)
        ();this.tabNavElement = this.element.querySelector('.' + this.options.tabNavClass
        // get the tab buttons in the container
        );this.tabNavItems = [].slice.call(this.tabNavElement.querySelectorAll('a')

        // apply the class to handle styling of tab states to the main container
        );this.element.classList.add('Tabs--nav-init'

        // handle events for tabs/larger screens
        );this.bindNavEvents();

        var startingTab = this.tabContentElements[this.options.defaultTab];
        this.openTab(startingTab);
    }

    _createClass(TabsToAccordion, [{
        key: 'fetchTabData',
        value: function fetchTabData() {
            // stores data for all tabs in this component
            this.tabData = [];

            var tabElement = void 0,
                tabTitle = void 0,
                tabData = void 0;

            for (var i = 0; i < this.tabContentElements.length; i++) {
                tabElement = this.tabContentElements[i];
                tabTitle = tabElement.previousElementSibling;
                tabData = {
                    tabId: tabElement.id,
                    tabTitle: tabTitle.innerText
                };

                this.tabData.push(tabData

                // set ARIA attributes for this tab content element
                );tabElement.setAttribute('role', 'tabpanel');
                tabElement.setAttribute('aria-hidden', 'true'

                // set ARIA attributes for this tab title element
                );tabTitle.setAttribute('role', 'tab');
                tabTitle.setAttribute('aria-controls', tabData.tabId);
                tabTitle.setAttribute('aria-selected', 'false');
                tabTitle.setAttribute('aria-expanded', 'false');
            }
        }
    }, {
        key: 'bindAccordionEvents',
        value: function bindAccordionEvents() {
            var tabTitles = this.accordion.querySelectorAll('.' + this.options.tabTitleClass);
            for (var i = 0; i < tabTitles.length; i++) {
                tabTitles[i].addEventListener('click', this.onTitleClick.bind(this));
                tabTitles[i].addEventListener('keydown', this.onTitleKeydown.bind(this));
            }
        }
    }, {
        key: 'onTitleClick',
        value: function onTitleClick(event) {
            event.preventDefault
            // get the content item associated with this title
            ();var tabContent = event.currentTarget.nextElementSibling;
            this.handleAccordion(tabContent);
        }
    }, {
        key: 'onTitleKeydown',
        value: function onTitleKeydown(event) {
            var currentIndex = this.handleKeyPress(event);
            if (currentIndex !== null) {
                this.handleAccordion(this.tabContentElements[currentIndex]);
            }
        }
    }, {
        key: 'handleKeyPress',
        value: function handleKeyPress(event) {
            var currentIndex = this.currentTab.position;
            var keyCodes = {
                SPACE: 32,
                ENTER: 13
                // DOWN: 40,
                // ESCAPE: 27,
                // HOME: 36,
                // LEFT: 37,
                // PAGE_DOWN: 34,
                // PAGE_UP: 33,
                // RIGHT: 39,
                // TAB: 9,
                // UP: 38
            };

            switch (event.keyCode) {
                // case keyCodes.LEFT:
                // case keyCodes.UP:
                //     currentIndex--
                //     if (currentIndex < 0) {
                //         currentIndex = this.tabData.length - 1
                //     }
                //     break

                case keyCodes.SPACE:
                case keyCodes.ENTER:
                    currentIndex = this.handleEnter(currentIndex);
                    break;

                default:
                    currentIndex = null;
            }

            return currentIndex;
        }
    }, {
        key: 'handleEnter',
        value: function handleEnter(currentIndex) {
            var tab = document.getElementById(document.activeElement.getAttribute('aria-controls'));
            if (tab !== this.currentTab.contentElement) {
                currentIndex = this.tabContentElements.indexOf(tab);
            }
            return currentIndex;
        }
    }, {
        key: 'handleAccordion',
        value: function handleAccordion(tabContentElement) {
            if (!this.isCurrentTab(tabContentElement)) {
                this.openAccordion(tabContentElement);
            }
            // else {
            //     this.closeAccordion(tabContentElement)
            // }
        }
    }, {
        key: 'isCurrentTab',
        value: function isCurrentTab(tabContentElement) {
            return this.currentTab.contentElement === tabContentElement;
        }
    }, {
        key: 'openAccordion',
        value: function openAccordion(tabContentElement) {
            this.closeTab();
            this.openTab(tabContentElement);
            this.currentTab.titleElement.focus
            // TODO scroll the body to reposition the active content
            ();
        }
    }, {
        key: 'bindNavEvents',
        value: function bindNavEvents() {
            for (var i = 0; i < this.tabNavItems.length; i++) {
                this.tabNavItems[i].addEventListener('click', this.onTabClick.bind(this));
            }
            // TODO handle keypress events for tabs
        }
    }, {
        key: 'onTabClick',
        value: function onTabClick(event) {
            event.preventDefault();
            var target = this.element.querySelector(event.currentTarget.hash);
            if (!this.isCurrentTab(target)) {
                this.closeTab();
                this.openTab(target);
            }
        }
    }, {
        key: 'closeTab',
        value: function closeTab() {
            this.currentTab.contentElement.setAttribute('aria-hidden', 'true');
            this.currentTab.titleElement.setAttribute('aria-selected', 'false');
            this.currentTab.titleElement.setAttribute('aria-expanded', 'false');
            this.tabNavItems[this.currentTab.position].setAttribute('aria-selected', 'false');
            this.tabNavItems[this.currentTab.position].setAttribute('aria-expanded', 'false');
            this.currentTab = null;
        }
    }, {
        key: 'openTab',
        value: function openTab(tabContentElement) {
            this.currentTab = {
                contentElement: tabContentElement,
                titleElement: tabContentElement.previousElementSibling,
                position: this.tabContentElements.indexOf(tabContentElement)
            };
            tabContentElement.setAttribute('aria-hidden', 'false');
            this.currentTab.titleElement.setAttribute('aria-selected', 'true');
            this.currentTab.titleElement.setAttribute('aria-expanded', 'true');

            this.updateTabNav();
        }
    }, {
        key: 'updateTabNav',
        value: function updateTabNav() {
            var tab = this.tabNavItems[this.currentTab.position];
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('aria-expanded', 'true');
        }
    }]);

    return TabsToAccordion;
}();

window.TabsToAccordion = TabsToAccordion;