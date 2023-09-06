const jwt = require('jsonwebtoken')

const middlewreController = {
    verifyToken: (req, res, next) => {
        const token = req.headers.token
        if (token) {
            // Bearer    
            const accessToken = token.split(" ")[1]
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err) {
                    res.status(403).json("Token bị sai")
                } else {
                    req.user = user
                    next()
                }
            })
        } else {
            res.status(401).json('Chưa Đăng Nhập')
        }
    },
    verifyAdmin: (req, res, next) => {
        if (req.user.role ==='admin') {
            next()
        } else {
            res.status(403).json("Bạn không được cấp quyền admin")
        }
    },
    verifyPro: (req, res, next) => {
        if (req.user.role ==='pro') {
            next()
        } else {
            res.status(403).json("Bạn không được cấp quyền pro")
        }
    },
    verifyTokenAndAdmin: (req, res, next) => {
        middlewreController.verifyToken(req, res, () => {
            middlewreController.verifyAdmin(req, res, next)
        })
    },
    verifyTokenAndPro: (req, res, next) => {
        middlewreController.verifyToken(req, res, () => {
            middlewreController.verifyPro(req, res, next)
        })
    }
}

module.exports = middlewreController
