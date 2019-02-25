#!/usr/bin/env node

`use strict`;

const package       = require('./package.json');
const util          = require('util');
const fs            = require('fs');
const program       = require('commander');
const xpath         = require('xpath');
const xmldom        = require('xmldom');
const puppeteer     = require('puppeteer');

const readFile      = util.promisify(fs.readFile);

function main() {
    program
        .name(package.name)
        .version(package.version)
        .option('-f --format <format>',
            'file format to export',
            /^(pdf|svg|gif|png|jpeg|bmp|ppm)$/, 'png')
        .option('-o --output <directory>',
            'selects a output directory', parseDirectory, process.cwd())
        .arguments('<xml-files...>')
        .action(exportFiles)
        .parse(process.argv)
}

function exportFiles(filePaths) {
    console.log(filePaths);
    
    const exportings = filePaths.map(exportFile);
    Promise.all(exportings)
        .then(values => {
            console.log(values);
        })
        .catch(reason => {
            console.error(reason);
        });
}

async function exportFile(filePath) {
    const fileContent = readFile(filePath, 'utf-8');
    const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-web-security']});
    const page = await browser.newPage();
    await page.goto(`file://${__dirname}/export.html`);
    await page.evaluate((xml) => {
        return render(xml);
    }, await fileContent);
    // await browser.close();
    console.log(await fileContent);
}

function parseDirectory(dirPath) {
    if (fs.statSync(dirPath).isDirectory()) {
        return dirPath;
    } else {
        throw new Error(`"${dirPath}" is not a directory`);
    }
}

try {
    main();
} catch(error) {
    console.error(error.message);
}
