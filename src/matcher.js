const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const fs = require('fs');
const captureWebsite = require('capture-website');

const options = {
    delay: 5,
    height: 1080,
    overwrite: true,
    scaleFactor: 2,
    width: 1920,
};

exports.getMatchRate = async (content, uuid, resultUrl) => {
    return new Promise(async (resolve, reject) => {
        await captureWebsite.file(content, `participant-${uuid}.png`, {
            ...options,
            inputType: 'html',
        });

        await captureWebsite.file(resultUrl, `base-result-${uuid}.png`, options);

        const img1 = PNG.sync.read(fs.readFileSync(`participant-${uuid}.png`));
        const img2 = PNG.sync.read(fs.readFileSync(`base-result-${uuid}.png`));
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img2.height, {
            threshold: 0,
            includeAA: true,
        });
        fs.writeFileSync(`diff-${uuid}.png`, PNG.sync.write(diff));

        const numMaxPixels = width * height;
        console.log('numDiffPixels', numDiffPixels);
        console.log('numMaxPixels', numMaxPixels);
        const likhet = (Math.abs(numDiffPixels / numMaxPixels - 1) * 100).toFixed(2);

        fs.unlinkSync(`participant-${uuid}.png`);
        //fs.unlinkSync(`base-result-${uuid}.png`);
        fs.unlinkSync(`diff-${uuid}.png`);
        return resolve(likhet);
    });
};
