
const puppeteer = require('puppeteer');
var fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({height: 1080, width: 1920});
  var link = 'http://control.fcit-ye.com/result.php';

  await page.goto(link);
  await page.screenshot({path: 'files/test.png'});
  

  // empty files
  fs.truncate('allStudents.txt', 0, function(){console.log('done')})
  fs.truncate('csStudents.txt', 0, function(){console.log('done')})
  fs.truncate('bestAllStudents.txt', 0, function(){console.log('done')})
  fs.truncate('bestCsStudents.txt', 0, function(){console.log('done')})

  let allStudents = [];
  let csStudents = [];

  let ALL_STUDENTS_COUNT = 186;
  for (let i = 1; i <= ALL_STUDENTS_COUNT; i++) {
    let number;
    if (i < 10)
      number = '000'+i;
    else if (i < 100) {
      number = '00'+i;
    } else {
      number = '0'+i;
    }
    
    if (false) {
      continue;
    }

    await page.waitForSelector('table > tbody > tr > td > #userid')
    await page.click('table > tbody > tr > td > #userid')
    await page.keyboard.type(`19_${number}`);
  
    await page.waitForSelector('table > tbody > tr > td > #clearpasswd')
    await page.click('table > tbody > tr > td > #clearpasswd')
    await page.keyboard.type('1234');
  
    await page.waitForSelector('table > tbody > tr:nth-child(3) > td > input')
    await page.click('table > tbody > tr:nth-child(3) > td > input')
  
    await page.waitFor(1000);

    try {await page.$('#infoform');} catch(e) {continue;}
    try {await page.click('body > #header > ul > li:nth-child(4) > a');} catch(e) {continue;}
    
    await page.waitFor(1000);
    
    try {await page.$('#main > div > table > tbody > tr:nth-child(3) > td:nth-child(4) > img');} catch(e) {continue;}


    let studentInfo = await page.evaluate(() => {
      var studentInfo = {};
      studentInfo.name = document.querySelector('#main > div > table > tbody > tr:nth-child(3) > td:nth-child(3)').textContent

      studentInfo.subjects = [];
      for (var i = 3; i <= 8; i++) {
          if (document.querySelector('#main > div > table > tbody > tr:nth-child(9) > td > table > tbody > tr:nth-child('+i+') > td:nth-child(5)') != null) {
            studentInfo.subjects.push(parseInt(document.querySelector('#main > div > table > tbody > tr:nth-child(9) > td > table > tbody > tr:nth-child('+i+') > td:nth-child(5)').textContent));
          }
      }
      
      studentInfo.total = 0;
      for (var i = 0; i < studentInfo.subjects.length; i++) {
        studentInfo.total += studentInfo.subjects[i];
      }
      
      studentInfo.section = document.querySelector('#main > div > table > tbody > tr:nth-child(6) > td:nth-child(2)').textContent
    
      studentInfo.final = (studentInfo.total / studentInfo.subjects.length).toFixed(2);

      return studentInfo;
    });
  
    console.log('student number ' + i);
    console.log(studentInfo);

    allStudents.push(studentInfo);
    if (studentInfo.section == 'علوم حاسوب (صباحي)') {
      csStudents.push(studentInfo);
    } 

    let string = studentInfo.name + ' total: ' + studentInfo.total + ' final ' + studentInfo.final + "%";
    fs.appendFile('allStudents.txt', string  + "    " + allStudents.length, function (err) {
      if (err) throw err;
    });
  
    if (studentInfo.section == 'علوم حاسوب (صباحي)') {
      fs.appendFile('csStudents.txt', string + "    " + csStudents.length, function (err) {
        if (err) throw err;
      });
    } 


    await page.waitForSelector('body > #header > ul > li:nth-child(5) > a')
    await page.click('body > #header > ul > li:nth-child(5) > a')
  }
  
  await page.close()
  await browser.close();

  for (let i = 0; i < allStudents.length; i++) {
    if (isNaN(allStudents[i].final)) {
      allStudents.splice(i, 1); 
    }
  }

  await allStudents.sort(function (a,b) {
    return (b.final - a.final); 
  })

  for (let i = 0; i < allStudents.length; i++) {
    fs.appendFile('bestAllStudents.txt', allStudents[i].name + " total: " + allStudents[i].total + " final: " + allStudents[i].final + "%  " + (i+1), function (err) {
      if (err) throw err;
    });
  }

  for (let i = 0; i < csStudents.length; i++) {
    if (isNaN(csStudents[i].final)) {
      csStudents.splice(i, 1); 
    }
  }

  await csStudents.sort(function (a,b) {
    return (b.final - a.final); 
  })

  for (let i = 0; i < csStudents.length; i++) {
    fs.appendFile('bestCsStudents.txt', csStudents[i].name + " total: " + csStudents[i].total + " final: " + csStudents[i].final + "%  " + (i+1), function (err) {
      if (err) throw err;
    });
  }

  fs.writeFileSync('./data.json', JSON.stringify(allStudents) , 'utf-8'); 

})();

