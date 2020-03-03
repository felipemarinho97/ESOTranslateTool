const express = require('express')
const { By, Builder, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

const app = express()

const ffOptions = new firefox.Options();
ffOptions.headless()
 
let driver = new Builder()
    .forBrowser('firefox')
    .setChromeOptions(/* ... */)
    .setFirefoxOptions(ffOptions)
    .build();

driver.get('https://translate.google.com')

const input = driver.findElement(By.css('.orig.tlid-source-text-input.goog-textarea'))

app.get('/translate', function (req, res) {
    input.sendKeys(req.query.text)
    driver.sleep(2000)
    driver.wait(until.elementsLocated(By.css('.result')), 150000).then(elm => {
            elm[0].getText().then(text => {
            input.clear()
            
            res.send(text)
        })
        
    })

})
  
app.listen(3000)