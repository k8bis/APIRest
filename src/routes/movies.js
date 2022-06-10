const {Router} = require('express');
const router = Router();

const movies = require('../sample.json');

router.get('/movies',(req, res) => {
    //res.send('movies');
    res.json(movies);
});

module.exports = router;