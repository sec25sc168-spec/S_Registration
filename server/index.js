const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const registeredStudents = [];

const studentSchema = new mongoose.Schema(
    {
        studentName: { type: String, required: true },
        rollNumber: { type: String, required: true },
        dob: String,
        bloodGroup: String,
        phoneNo: String,
        emailId: String,
        address: String,
        department: String,
        gender: String,
        year: String,
        section: String,
        backlogs: Number,
        companyPreferences: [String],
    },
    { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('Server will continue in fallback in-memory mode.');
    }
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

app.get('/api/students', async (req, res) => {
    try {
        const students = mongoose.connection.readyState === 1
            ? await Student.find().sort({ createdAt: -1 }).lean()
            : registeredStudents;

        return res.json({ students });
    } catch (error) {
        console.error('Get students error:', error.message);
        return res.status(500).json({ message: 'Failed to fetch students.' });
    }
});

app.post('/api/register', async (req, res) => {
    const student = req.body;

    if (!student || !student.studentName || !student.rollNumber) {
        return res.status(400).json({ message: 'Student name and roll number are required.' });
    }

    try {
        let savedStudent;

        if (mongoose.connection.readyState === 1) {
            savedStudent = await Student.create({
                ...student,
                companyPreferences: Array.isArray(student.companyPreferences) ? student.companyPreferences : [],
            });
        } else {
            savedStudent = {
                ...student,
                id: Date.now(),
            };
            registeredStudents.unshift(savedStudent);
        }

        return res.status(201).json({
            message: 'Student registered successfully',
            student: savedStudent,
        });
    } catch (error) {
        console.error('Register student error:', error.message);
        return res.status(500).json({ message: 'Failed to register student.' });
    }
});

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
