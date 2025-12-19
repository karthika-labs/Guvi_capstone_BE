const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const token = authHeader.startsWith("Bearer ")?authHeader.split(" ")[1] : authHeader;


        const decoded = jwt.verify(token, process.env.jwt_secretkey);


        req.user = decoded // example: decoded = { _id: "userid123", iat:..., exp:... }

        next();
    }
    catch (e) {
        return res.status(401).json({ message: "Invalid or expired token", error: e.message });
    }
};

module.exports = auth;
