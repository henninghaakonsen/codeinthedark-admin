const express = require('express');
const sanity = express.Router();
const sanityClient = require('@sanity/client');

const client = sanityClient({
    dataset: 'production',
    projectId: 'an0jzjry',
    useCdn: true,
});

const setupSanityRoutes = () => {
    sanity.get('/games/:gameid', (req, res) => {
        client
            .fetch(`*[_type == "game" && id == "${req.params.gameid}"]`)
            .then(fetchedContent => {
                if (fetchedContent.length === 0 || fetchedContent.length > 1) {
                    res.status(400).json({ message: 'Fant 0 eller flere spill med id' });
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write(fetchedContent[0].result_html);
                    res.end();
                }
            })
            .catch(error => {
                res.status(500).json(error);
            });
    });

    return sanity;
};

module.exports = setupSanityRoutes;
