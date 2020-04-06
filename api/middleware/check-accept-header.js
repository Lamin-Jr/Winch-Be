module.exports.json = (req, res, next) => { return req.accepts('json') ? next() : next('route'); }
module.exports.text = (req, res, next) => { return req.accepts('text') ? next() : next('route'); }
module.exports.html = (req, res, next) => { return req.accepts('html') ? next() : next('route'); }