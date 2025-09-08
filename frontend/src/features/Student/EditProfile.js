import React, { useState, useEffect, useContext } from "react";
import "../../styles/ViewProfile.css";
import AppContext from "../../context/AppContext";

const engineeringDepartments = [
  { _id: "dept1", name: "CSE" },
  { _id: "dept2", name: "Mechanical" },
  { _id: "dept3", name: "ECE" },
  { _id: "dept4", name: "Electrical" },
];

// Reusable Input Field
const InputField = ({ label, ...props }) => (
  <div className="form-group">
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default function EditProfile() {
  const { currentUser, allBatches } = useContext(AppContext);

  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    studentId: "",
    email: "",
    department: "CSE",
    batch: "",
    semester: 5,
    cgpa: "",
    activeBacklog: "",
    numSemesters: 5,
    sgpa: Array(5).fill(""),
    avatarUrl: "https://www.svgrepo.com/show/210944/avatar.svg",
    avatarFile: null,
  });

  // Load current user
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        ...currentUser,
        department: currentUser?.department?.name || "CSE",
        batch: currentUser?.batch?.name || "",
      }));
    }
  }, [currentUser]);

  // Generic change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => {
      let updated = { ...prev, [name]: value };

      if (name === "semester" || name === "numSemesters") {
        const semCount = Number(value) || 0;
        updated.semester = semCount;
        updated.numSemesters = semCount;
        updated.sgpa = prev.sgpa.slice(0, semCount).concat(Array(semCount - prev.sgpa.length).fill(""));
      }
      return updated;
    });
  };

  // SGPA change handler
  const handleSgpaChange = (i, val) => {
    if (val === "" || /^(\d+\.?\d{0,2})?$/.test(val)) {
      if (val === "" || parseFloat(val) <= 10) {
        setProfile((prev) => {
          const sgpa = [...prev.sgpa];
          sgpa[i] = val;
          return { ...prev, sgpa };
        });
      }
    }
  };

  // Auto calculate CGPA
  useEffect(() => {
    const sgpaNums = profile.sgpa
      .map((s) => parseFloat(s))
      .filter((n) => !isNaN(n));
    const avg = sgpaNums.length ? (sgpaNums.reduce((a, b) => a + b, 0) / sgpaNums.length).toFixed(2) : "";
    if (avg !== profile.cgpa) setProfile((p) => ({ ...p, cgpa: avg }));
  }, [profile.sgpa]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({
        ...prev,
        avatarUrl: URL.createObjectURL(file),
        avatarFile: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      alert("Please enter a valid email address");
      return;
    }
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Profile updated and saved!");
  };

  return (
    <form className="profile-container" onSubmit={handleSubmit}>
      <div className="main">
        <h1 className="heading">Edit Profile</h1>
        <hr className="hr" />

        {/* Avatar */}
        <div className="profile-row">
          <div>
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="avatar"
              onClick={() => document.getElementById("avatarInput").click()}
            />
            <input
              type="file"
              id="avatarInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Basic Info */}
          <div className="profile-columns">
            <InputField label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} readOnly />
            <InputField label="Middle Name" name="middleName" value={profile.middleName} onChange={handleChange} readOnly />
            <InputField label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} readOnly />
            <InputField label="Student ID" name="studentId" value={profile.studentId} onChange={handleChange} readOnly />
            <InputField label="Email ID" type="email" name="email" value={profile.email} onChange={handleChange} readOnly />
          </div>

          {/* Department / Batch */}
          <div className="profile-columns">
            <div className="form-group">
              <label className="label">Department</label>
              <select className="input" name="department" value={profile.department} onChange={handleChange}>
                <option value="" disabled>Select department</option>
                {engineeringDepartments.map((dept) => (
                  <option key={dept._id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Batch</label>
              <select className="input" name="batch" value={profile.batch} onChange={handleChange}>
                <option value="" disabled>Select batch</option>
                {allBatches?.map((batch) => (
                  <option key={batch._id || batch.id || batch.name} value={batch.name}>{batch.name}</option>
                ))}
              </select>
            </div>
            <InputField label="Semester" type="number" min="1" name="semester" value={profile.semester} onChange={handleChange} />
          </div>
        </div>

        {/* Academic */}
        <h2 className="subheading">Academic Profile</h2>
        <hr className="hr" />
        <div className="academic-row">
          <InputField label="CGPA (calculated)" name="cgpa" value={profile.cgpa} readOnly />
          <InputField label="Active Backlog" name="activeBacklog" value={profile.activeBacklog} onChange={handleChange} />
        </div>
        <div className="academic-row">
          <InputField label="No. of Semesters" type="number" min="1" name="numSemesters" value={profile.numSemesters} onChange={handleChange} />
        </div>

        {/* SGPA Table */}
        <table className="semester-table">
          <thead>
            <tr>
              <th>SEMESTER</th>
              {Array.from({ length: profile.numSemesters }, (_, i) => (
                <th key={`sem-${i}`}>{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SGPA</td>
              {profile.sgpa.map((sgpa, i) => (
                <td key={`sgpa-${i}`}>
                  <input
                    className="input-short"
                    value={sgpa}
                    onChange={(e) => handleSgpaChange(i, e.target.value)}
                    placeholder={`S${i + 1} GPA`}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Actions */}
        <hr className="hr" />
        <h2 className="subheading">Account Setting</h2>
        <div className="button-row">
          <button className="reset-btn" type="button" onClick={() => alert("Reset Password")}>Reset Password</button>
          <button className="edit-btn" type="submit">Save Changes</button>
        </div>
      </div>
    </form>
  );
}
