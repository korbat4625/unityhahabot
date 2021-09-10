function errHandling (err, req, res, next) {
    console.error(err);
    res.render('err', {
        err
    })
}

module.exports = {
    errHandling
}