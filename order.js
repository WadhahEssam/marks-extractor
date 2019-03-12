let data = require('./data.json')
let fs = require('fs');

let counter = 1;
for (let i = 0; i < data.length; i++) {
  // if (data[i].section === 'علوم حاسوب (صباحي)') {
    console.log(data[i].name + " total: " + data[i].total + " final: " + data[i].final + "%  " + (counter++));
  // }
}

