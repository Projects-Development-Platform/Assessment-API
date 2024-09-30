const { StatusCodes } = require("http-status-codes");

const errorHandler = (err, req, res, next) => {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Validation Error!',
            data: Object.keys(err.errors).map(path => {
                console.log(err.errors[path], err.errors[path].kind);
                if (err.errors[path].kind === "enum") {
                    return {
                        path,
                        message: `Invalid value '${err.errors[path].value}' for '${path}', valid values are ${err.errors[path].properties.enumValues.join(", ")}`,
                    };
                } else if (err.errors[path].kind === "required") {
                    return { path, message: `'${path}' is required` };
                } else if (err.errors[path].kind === "unique") {
                    return { path, message: `'${path}' must be unique` };
                } else if (err.errors[path].kind === "ObjectId") {
                    return { path, message: `'${path}' must be a valid ObjectId` };
                } else if (err.errors[path].kind === "date") {
                    return { path, message: `'${path}' must be a valid Date` };
                }
                return { path, message: err.errors[path].message };
            }),
        })
    }

    if (err.name === "MongoServerError") {
        console.log({ ...err })
        if (err.code === 11000) {
            let errorObject = {
                success: false,
                message: 'Validation Error!',
                data: []
            };
            errorObject.data.push({ path: Object.keys(err.keyValue)[0], message: `The value '${Object.values(err.keyValue)[0]}' is duplicate.` });
            return res.status(StatusCodes.BAD_REQUEST).json(errorObject);
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some Internal Server Error!", message: err.message });
    }

    if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Invalid JSON!", message: err.message });
    }

    console.error(err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Some Internal Server Error!", message: err.message });
};


module.exports = errorHandler;