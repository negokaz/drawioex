#!/usr/bin/env node

`use strict`;

const package       = require('./package.json');
const util          = require('util');
const fs            = require('fs');
const path          = require('path');
const program       = require('commander');
const puppeteer     = require('puppeteer');

const readFile      = util.promisify(fs.readFile);
const writeFile     = util.promisify(fs.writeFile);

function main() {
    program
        .name(package.name)
        .version(package.version)
        .option('-f --format <format>',
            'file format to export [svg, png]',
            /^(svg|png)$/, 'svg')
        .option('-o --output <directory>',
            'selects a output directory', parseDirectory, process.cwd())
        .option('--debug', 'enable debug mode')
        .arguments('<xml-files...>')
        .action(exportFiles)
        .parse(process.argv)
}

async function exportFiles(filePaths) {
    const nonDebugMode = !program.debug;
    const format = program.format;
    const outputDirectory = program.output;
    const outputExtension = program.format;
    const browser = await puppeteer.launch({headless: nonDebugMode, args: ['--no-sandbox', '--disable-web-security']});
    try {
        const browserPage = await browser.newPage();
        await browserPage.goto(`file://${__dirname}/export.html`);
        const exportings = filePaths.map(filePath => exportFile(filePath, format, outputDirectory, outputExtension, browserPage));
        return await Promise.all(exportings);
    } catch (error) {
        console.log(error);
        process.exit(1);
    } finally {
        if (nonDebugMode) {
            await browser.close();
        }
    }
}

async function exportFile(filePath, format, outputDirectory, outputExtension, browserPage) {
    const basename = path.basename(filePath, path.extname(filePath));
    const baseFilePath = path.join(outputDirectory, basename);

    const fileContent = readFile(filePath, 'utf-8');
    const results =
        await browserPage.evaluate((xml, format) => {
            return Promise.all(exportImage(xml, format));
        }, await fileContent, format);
    const writings =
        results.map((result, index) => {
            const outputFilePath = 
                results.length > 1 
                    ? `${baseFilePath}.${index}.${outputExtension}` 
                    : `${baseFilePath}.${outputExtension}`;
            console.log(`exporting ${outputFilePath}`);
            return writeFile(outputFilePath, result.data, result.encoding);
        });
    return Promise.all(writings);
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
    process.exit(1);
}
