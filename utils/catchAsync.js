module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

//catch the error and passes to next