const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./user");

const router = express.Router();


// 1. USER REGISTRATION

router.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must have at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // PASSWORD HASHING

        const passwordHash = await bcrypt.hash(password, 12);

        const user = new User({

            name,
            email: email.toLowerCase(),
            passwordHash,
            role: "student"

        });

        await user.save();

        res.status(201).json({
            message: "Registration Successful"
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration Failed"
        });

    }

});


// 2. USER LOGIN

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        // PASSWORD VERIFICATION

        const validPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        // JWT TOKEN GENERATION

        const token = jwt.sign(

            {
                userId: user._id,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1h"
            }

        );

        res.json({

            message: "Login Successful",

            token,

            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }

        });

    } catch (error) {

        res.status(500).json({
            message: "Login Failed"
        });

    }

});


// 3. TOKEN VERIFICATION

function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {

        return res.status(401).json({
            message: "Token Required"
        });

    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        res.status(401).json({
            message: "Invalid or Expired Token"
        });

    }

}


// 4. USER AUTHORIZATION

function authorizeRole(role) {

    return (req, res, next) => {

        if (req.user.role !== role) {

            return res.status(403).json({
                message: "Access Denied"
            });

        }

        next();

    };

}


// 5. PROTECTED PROFILE

router.get("/profile", verifyToken, async (req, res) => {

    const user = await User.findById(req.user.userId)
        .select("-passwordHash");

    if (!user) {
        return res.status(404).json({
            message: "User Not Found"
        });
    }

    res.json(user);

});


// 6. PROTECTED COURSE MATERIALS

router.get("/courses", verifyToken, (req, res) => {

    res.json({

        courses: [
            "Digital Electronics",
            "Microcontrollers",
            "Communication Systems",
            "VLSI Design"
        ]

    });

});


// 7. PROTECTED ACADEMIC RECORDS

router.get("/records", verifyToken, (req, res) => {

    res.json({

        records: [
            {
                subject: "Digital Electronics",
                marks: 85
            },

            {
                subject: "Communication Systems",
                marks: 90
            }

        ]

    });

});


// 8. ADMIN AUTHORIZATION

router.get(
    "/admin",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {

        res.json({
            message: "Welcome Admin"
        });

    }
);


module.exports = router;