const node_server_screenshot = require('node-server-screenshot');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const fs = require('fs');

const options = {
    width: 1400,
    height: 1400,
};

const numMaxPixels = options.width * options.height;

exports.getMatchRate = (content, uuid, resultUrl) => {
    node_server_screenshot.fromURL(content, `participant-${uuid}.png`, options, () => {
        console.log('finished');
    });
    node_server_screenshot.fromURL(resultUrl, 'base-result.png', options, () => {
        console.log('finished');
    });

    const img1 = PNG.sync.read(fs.readFileSync(`participant-${uuid}.png`));
    const img2 = PNG.sync.read(fs.readFileSync('base-result.png'));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, img1.width, img2.height, {
        threshold: 0.1,
    });
    fs.writeFileSync('diff.png', PNG.sync.write(diff));

    const equality = (Math.abs(numDiffPixels / numMaxPixels - 1) * 100).toFixed(2);

    return equality;
};
