import express from 'express';
import mysql from 'mysql2/promise';
import session from 'express-session';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// To get current directory in an ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve frontend (HTML, JS, CSS) from 'src/'
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Session configuration
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true only if using HTTPS in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // session lasts 1 day
    }
}));

// Multer setup for profile picture upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// MySQL connection
async function initDB() {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'anuTomar@1003',
            database: 'tailmates',
        });
        return db;
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1);
    }
}

const db = await initDB();

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, countryCode, phoneNumber, password, city, zipCode, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            "INSERT INTO registered_users (First_Name, Last_Name, E_Mail, Country_Code, Phone_Number, Password, City, Zip_Code, User_Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [firstName, lastName, email, countryCode, phoneNumber, hashedPassword, city, zipCode, role]
        );

        const userID = result.insertId;
        req.session.userID = userID;
        console.log('Session after signup:', req.session);

        res.status(201).json({ message: 'User registered and logged in successfully!', userID });
    } catch (err) {
        console.error('Database Error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Email already registered.' });
        } else {
            res.status(500).json({ message: 'Server error.' });
        }
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM registered_users WHERE E_Mail = ?', [email]);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.Password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        req.session.userID = user.User_ID;
        console.log('Session after login:', req.session);

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protected route: Ensure user is logged in
function ensureAuthenticated(req, res, next) {
    if (!req.session.userID) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }
    next();
}

// Caretaker Profile endpoint
app.post('/api/caretaker-profile', upload.single('profilePic'), ensureAuthenticated, async (req, res) => {
    const userID = req.session.userID;

    try {
        const {
            availability,
            experience,
            careType,
            services,
            petTypes,
            bio,
            charges
        } = req.body;

        const profilePicPath = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await db.execute(
            "INSERT INTO caretaker_profiles (Caretaker_ID, Availability, Experience_Yrs, Care_Type, Services, Preferred_Pet_Types, Short_Bio, Charges, Profile_Picture_Path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                userID,
                availability,
                experience,
                careType,
                services,
                petTypes,
                bio,
                charges,
                profilePicPath
            ]
        );

        res.status(201).json({ message: 'Caretaker profile saved successfully!' });
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Pet Profile endpoint
app.post('/api/pet-profile', upload.single('profilePic'), ensureAuthenticated, async (req, res) => {
    const userID = req.session.userID;

    const { petName, petBreed, petDetails, hireCaretaker, careType, petBio } = req.body;
    const profilePicPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [result] = await db.execute(
            `INSERT INTO pet_profiles 
                (Pet_ID, Pet_Name, Pet_Breed, Pet_Details, Hire_Caretaker, Care_Type, Pet_Bio, Profile_Picture_Path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userID,
                petName,
                petBreed,
                petDetails,
                hireCaretaker,
                careType,
                petBio,
                profilePicPath
            ]
        );

        res.status(201).json({ message: 'Pet profile created successfully!' });
    } catch (err) {
        console.error('Database Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Database Connected. Server running on http://localhost:${PORT}`);
});
