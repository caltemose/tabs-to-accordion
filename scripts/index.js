'use strict';

/* global TabsToAccordion */
console.log('index.js');

var el = document.getElementById('msg');

var arr = ["Hi", "there"];

var arr2 = [].concat(arr, ["señorita!", "Javascript is working."]);

var msg = arr2.join(' ');

console.log(msg);
el.innerText = msg;

new window.TabsToAccordion(document.getElementById("Tabs"));