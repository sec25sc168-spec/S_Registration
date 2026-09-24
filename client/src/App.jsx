import { useEffect, useMemo, useState } from 'react'
import './App.css'

const companies = [
  'HCL',
  'TCS',
  'Wipro',
  'Amazon',
  'Infosys',
  'Accenture',
  'Capgemini',
  'Cognizant',
  'Microsoft',
  'IBM',
]

const initialForm = {
  studentName: '',
  rollNumber: '',
  dob: '',
  bloodGroup: '',
  phoneNo: '',
  emailId: '',
  address: '',
  department: '',
  gender: '',
  year: '',
  section: '',
  backlogs: '',
}

function App() {
  const [view, setView] = useState('student')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')

  const companySummary = useMemo(() => {
    return students.reduce((acc, student) => {
      const preferredCompanies = student.companyPreferences || []
      preferredCompanies.forEach((company) => {
        if (!acc[company]) {
          acc[company] = []
        }

        acc[company].push({
          name: student.studentName,
          rollNumber: student.rollNumber,
          year: student.year,
          department: student.department,
        })
      })

      return acc
    }, {})
  }, [students])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleCompany = (company) => {
    setSelectedCompanies((prev) => {
      if (prev.includes(company)) {
        return prev.filter((item) => item !== company)
      }

      if (prev.length >= 4) {
        return prev
      }

      return [...prev, company]
    })
  }

  const validateStudentInfo = () => {
    const requiredFields = [
      'studentName',
      'rollNumber',
      'dob',
      'bloodGroup',
      'phoneNo',
      'emailId',
      'address',
      'department',
      'gender',
      'year',
      'section',
      'backlogs',
    ]

    return requiredFields.every((field) => {
      const value = form[field]
      return value !== '' && value !== null && value !== undefined
    })
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students')

        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (Array.isArray(data.students)) {
          setStudents(data.students)
        }
      } catch (error) {
        console.warn('Backend not available yet, using local state only.', error)
      }
    }

    fetchStudents()
  }, [])

  const registerStudent = async () => {
    if (!validateStudentInfo()) {
      setError('Please fill in all student details before continuing.')
      return
    }

    const backlogCount = Number(form.backlogs)

    if (backlogCount === 0 && selectedCompanies.length !== 4) {
      setError('Students with zero backlogs must choose exactly four companies.')
      return
    }

    const newStudent = {
      ...form,
      id: Date.now(),
      companyPreferences: backlogCount === 0 ? selectedCompanies : [],
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      })

      if (!response.ok) {
        throw new Error('Failed to register student on the server.')
      }

      const data = await response.json()
      setStudents((prev) => [data.student, ...prev])
    } catch (error) {
      console.warn('Server unavailable, saving locally instead.', error)
      setStudents((prev) => [newStudent, ...prev])
    }

    setForm(initialForm)
    setSelectedCompanies([])
    setError('')
    setStep(1)
    setView('admin')
  }

  const continueToCompanyStep = () => {
    if (!validateStudentInfo()) {
      setError('Please fill in all student details before continuing.')
      return
    }

    const backlogCount = Number(form.backlogs)

    if (backlogCount > 0) {
      registerStudent()
      return
    }

    setError('')
    setStep(2)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Campus registration portal</p>
          <h1>Student Registration Desk</h1>
        </div>
        <nav className="nav-tabs" aria-label="Main navigation">
          <button
            type="button"
            className={view === 'student' ? 'tab active' : 'tab'}
            onClick={() => {
              setView('student')
              setError('')
            }}
          >
            Student Form
          </button>
          <button
            type="button"
            className={view === 'admin' ? 'tab active' : 'tab'}
            onClick={() => setView('admin')}
          >
            Admin View
          </button>
        </nav>
      </header>

      {view === 'student' ? (
        <main className="panel">
          {step === 1 ? (
            <form className="student-form" onSubmit={(event) => event.preventDefault()}>
              <div className="form-heading">
                <h2>Student details</h2>
                <span>Step 1 of 2</span>
              </div>

              <div className="form-grid">
                <label>
                  Student Name
                  <input name="studentName" value={form.studentName} onChange={handleChange} placeholder="Enter full name" />
                </label>

                <label>
                  Roll Number
                  <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="Enter roll number" />
                </label>

                <label>
                  Date of Birth
                  <input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </label>

                <label>
                  Blood Group
                  <input name="bloodGroup" value={form.bloodGroup} onChange={handleChange} placeholder="A+, O-, etc." />
                </label>

                <label>
                  Phone No
                  <input name="phoneNo" value={form.phoneNo} onChange={handleChange} placeholder="Enter phone number" />
                </label>

                <label>
                  Email ID
                  <input type="email" name="emailId" value={form.emailId} onChange={handleChange} placeholder="example@email.com" />
                </label>

                <label className="full-width">
                  Address
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter home address" rows="3" />
                </label>

                <label>
                  Department
                  <select name="department" value={form.department} onChange={handleChange}>
                    <option value="">Select department</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </label>

                <label>
                  Gender
                  <select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Year
                  <select name="year" value={form.year} onChange={handleChange}>
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </label>

                <label>
                  Section
                  <select name="section" value={form.section} onChange={handleChange}>
                    <option value="">Select section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </label>

                <label>
                  No. of Backlogs
                  <input type="number" min="0" name="backlogs" value={form.backlogs} onChange={handleChange} placeholder="0" />
                </label>
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="action-row">
                <button type="button" className="primary-btn" onClick={continueToCompanyStep}>
                  {Number(form.backlogs) === 0 ? 'Next: Choose Companies' : 'Register Student'}
                </button>
              </div>
            </form>
          ) : (
            <div className="company-panel">
              <div className="form-heading">
                <h2>Choose four MNC companies</h2>
                <span>Step 2 of 2</span>
              </div>

              <p className="selection-note">
                You have selected <strong>{selectedCompanies.length}</strong> of 4 companies.
              </p>

              <div className="company-grid">
                {companies.map((company) => {
                  const isSelected = selectedCompanies.includes(company)

                  return (
                    <button
                      key={company}
                      type="button"
                      className={isSelected ? 'company-card selected' : 'company-card'}
                      onClick={() => toggleCompany(company)}
                    >
                      <span>{company}</span>
                      {isSelected && <strong>Selected</strong>}
                    </button>
                  )
                })}
              </div>

              {error && <p className="error-message">{error}</p>}

              <div className="action-row">
                <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="button" className="primary-btn" onClick={registerStudent}>
                  Register & view admin
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="panel admin-panel">
          <div className="admin-header">
            <h2>Registered Students - Company Wise</h2>
            <button type="button" className="primary-btn" onClick={() => setView('student')}>
              Add New Student
            </button>
          </div>

          {Object.keys(companySummary).length === 0 ? (
            <div className="empty-state">
              <p>No students registered yet.</p>
            </div>
          ) : (
            <div className="company-summary-grid">
              {Object.entries(companySummary).map(([company, entries]) => (
                <div key={company} className="summary-card">
                  <div className="summary-header">
                    <h3>{company}</h3>
                    <span>{entries.length} student(s)</span>
                  </div>

                  <ul>
                    {entries.map((entry) => (
                      <li key={`${company}-${entry.rollNumber}`}>
                        <strong>{entry.name}</strong>
                        <span>{entry.rollNumber}</span>
                        <span>{entry.department}</span>
                        <span>{entry.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}

export default App
