const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'pug');

app.get('/add', (req, res) => {
    const sum = parseInt(req.query.a) + parseInt(req.query.b);
    res.status(200).end(sum.toString());
});
app.get('/adds/:a/:b', (req, res) => {
    const sum = parseInt(req.params.a) + parseInt(req.params.b);
    res.status(200).end(sum.toString());
});
app.listen(8080, () => {
    console.log(`app listening on port 8080`)
});
