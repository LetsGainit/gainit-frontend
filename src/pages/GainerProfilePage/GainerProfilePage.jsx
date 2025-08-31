import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAccessToken } from "../../auth/auth";
import Toast from "../../components/Toast";
import "./GainerProfilePage.css";

const GainerProfilePage = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    biography: "",
    profilePictureURL: "",
    linkedInURL: "",
    gitHubURL: "",
    currentRole: "",
    yearsOfExperience: "",
    educationStatus: "",
    areasOfInterest: [],
    programmingLanguages: [],
    technologies: [],
    tools: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [serverUserId, setServerUserId] = useState(null);

  // Education status options
  const educationOptions = [
    "High School",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Self-Taught",
    "Bootcamp",
    "Other",
  ];

  // Predefined options for multi-select fields
  const predefinedOptions = {
    areasOfInterest: [
      "Web Development",
      "Mobile Development",
      "Data Science",
      "Machine Learning",
      "Cybersecurity",
      "Cloud Computing",
      "DevOps",
      "UI/UX Design",
      "Game Development",
      "Blockchain",
      "IoT",
      "AI/ML",
      "Database Design",
      "API Development",
      "Full Stack Development",
      "Frontend Development",
      "Backend Development",
      "Mobile App Development",
      "Data Analysis",
      "Software Testing",
      "Project Management",
      "Agile Development",
    ],
    programmingLanguages: [
      "JavaScript",
      "Python",
      "Java",
      "C#",
      "C++",
      "C",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
      "TypeScript",
      "PHP",
      "Ruby",
      "Scala",
      "R",
      "MATLAB",
      "Perl",
      "Haskell",
      "Elixir",
      "Clojure",
      "F#",
      "Dart",
    ],
    technologies: [
      "React",
      "Vue.js",
      "Angular",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "ASP.NET Core",
      "Laravel",
      "Ruby on Rails",
      "FastAPI",
      "GraphQL",
      "REST API",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "Google Cloud",
      "Firebase",
      "Heroku",
      "Vercel",
      "Netlify",
    ],
    tools: [
      "Git",
      "GitHub",
      "GitLab",
      "Bitbucket",
      "VS Code",
      "IntelliJ IDEA",
      "Eclipse",
      "Postman",
      "Insomnia",
      "Figma",
      "Adobe XD",
      "Sketch",
      "Jira",
      "Trello",
      "Asana",
      "Slack",
      "Discord",
      "Zoom",
      "Docker Desktop",
      "Kubernetes Dashboard",
      "AWS CLI",
      "Azure CLI",
    ],
  };

  useEffect(() => {
    // Get server user ID on mount
    fetchServerUserId();
  }, []);

  const fetchServerUserId = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL ||
          "https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/"
        }api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const userData = await response.json();
        setServerUserId(userData.id || userData.userId);
      } else {
        throw new Error("Failed to fetch user ID");
      }
    } catch (error) {
      console.error("Error fetching server user ID:", error);
      setToastMessage("Failed to load user information. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const validateForm = () => {
    // Clear previous errors first
    setErrors({});

    const newErrors = {};

    // Required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = "Full name must be 100 characters or less";
    }

    if (!formData.biography.trim()) {
      newErrors.biography = "Biography is required";
    } else if (formData.biography.length > 1000) {
      newErrors.biography = "Biography must be 1000 characters or less";
    }

    if (!formData.currentRole.trim()) {
      newErrors.currentRole = "Current role is required";
    } else if (formData.currentRole.length > 100) {
      newErrors.currentRole = "Current role must be 100 characters or less";
    }

    if (!formData.yearsOfExperience) {
      newErrors.yearsOfExperience = "Years of experience is required";
    } else if (
      isNaN(formData.yearsOfExperience) ||
      formData.yearsOfExperience < 0 ||
      formData.yearsOfExperience > 50
    ) {
      newErrors.yearsOfExperience =
        "Years of experience must be between 0 and 50";
    }

    if (!formData.educationStatus) {
      newErrors.educationStatus = "Education status is required";
    }

    if (formData.areasOfInterest.length === 0) {
      newErrors.areasOfInterest = "At least one area of interest is required";
    }

    // URL validation
    const urlFields = ["profilePictureURL", "linkedInURL", "gitHubURL"];
    urlFields.forEach((field) => {
      if (formData[field] && formData[field].length > 200) {
        newErrors[field] = "URL must be 200 characters or less";
      } else if (formData[field] && !isValidUrl(formData[field])) {
        newErrors[field] = "Please enter a valid URL";
      }
    });

    // Areas of interest combined length validation
    const combinedInterestLength = formData.areasOfInterest.join(", ").length;
    if (combinedInterestLength > 1000) {
      newErrors.areasOfInterest =
        "Combined areas of interest must be 1000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing or when field becomes valid
    if (errors[field]) {
      // Validate the specific field to see if error should be cleared
      let shouldClearError = false;

      switch (field) {
        case "fullName":
          shouldClearError =
            value.trim().length > 0 && value.trim().length <= 100;
          break;
        case "biography":
          shouldClearError =
            value.trim().length > 0 && value.trim().length <= 1000;
          break;
        case "currentRole":
          shouldClearError =
            value.trim().length > 0 && value.trim().length <= 100;
          break;
        case "yearsOfExperience": {
          const numValue = parseInt(value);
          shouldClearError =
            !isNaN(numValue) && numValue >= 0 && numValue <= 50;
          break;
        }
        case "educationStatus":
          shouldClearError = value.length > 0;
          break;
        case "profilePictureURL":
          shouldClearError =
            !value || (value.length <= 200 && isValidUrl(value));
          break;
        case "linkedInURL":
          shouldClearError =
            !value || (value.length <= 200 && isValidUrl(value));
          break;
        case "gitHubURL":
          shouldClearError =
            !value || (value.length <= 200 && isValidUrl(value));
          break;
        default:
          shouldClearError = true;
      }

      if (shouldClearError) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    }
  };

  const handleMultiSelectChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user makes selection or when field becomes valid
    if (errors[field]) {
      let shouldClearError = false;

      switch (field) {
        case "areasOfInterest": {
          shouldClearError =
            value.length > 0 && value.join(", ").length <= 1000;
          break;
        }
        case "programmingLanguages":
        case "technologies":
        case "tools":
          // These are optional fields, so always clear errors
          shouldClearError = true;
          break;
        default:
          shouldClearError = true;
      }

      if (shouldClearError) {
        setErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!serverUserId) {
      setToastMessage("User information not loaded. Please try again.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await getAccessToken();

      const payload = {
        fullName: formData.fullName.trim(),
        biography: formData.biography.trim(),
        facebookPageURL: "",
        linkedInURL: formData.linkedInURL.trim() || "",
        gitHubURL: formData.gitHubURL.trim() || "",
        gitHubUsername: "",
        profilePictureURL: formData.profilePictureURL.trim() || "",
        currentRole: formData.currentRole.trim(),
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        educationStatus: formData.educationStatus,
        areasOfInterest: formData.areasOfInterest,
        programmingLanguages: formData.programmingLanguages,
        technologies: formData.technologies,
        tools: formData.tools,
      };

      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL ||
          "https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/"
        }api/users/gainer/${serverUserId}/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        // Update user context and navigate to home
        await refreshUserData();

        setToastMessage("Profile created successfully! Redirecting to home...");
        setToastType("success");
        setShowToast(true);

        // Navigate to home after a short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        const errorData = await response.json();

        if (response.status === 400 && errorData.errors) {
          // Handle validation errors from backend
          const backendErrors = {};
          Object.keys(errorData.errors).forEach((key) => {
            backendErrors[key] = errorData.errors[key];
          });
          setErrors(backendErrors);

          setToastMessage("Please fix the errors below and try again.");
          setToastType("error");
          setShowToast(true);
        } else {
          throw new Error(errorData.message || "Failed to create profile");
        }
      }
    } catch (error) {
      console.error("Error creating profile:", error);

      if (error.message.includes("401")) {
        setToastMessage("Authentication failed. Please sign in again.");
        setToastType("error");
        setShowToast(true);
      } else {
        setToastMessage(
          error.message || "Failed to create profile. Please try again."
        );
        setToastType("error");
        setShowToast(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <div className="gainer-profile-page">
      <div className="gainer-profile-container">
        <div className="page-header">
          <h1 className="page-title">Create Gainer Profile</h1>
          <p className="page-subtitle">
            Set up your profile to start collaborating on GainIt.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-card">
            {/* Basic Information Section */}
            <div className="form-section">
              <h2 className="section-title">Basic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    className={`form-input ${errors.fullName ? "error" : ""}`}
                    placeholder="Enter your full name"
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="biography" className="form-label">
                    Biography <span className="required">*</span>
                  </label>
                  <textarea
                    id="biography"
                    value={formData.biography}
                    onChange={(e) =>
                      handleInputChange("biography", e.target.value)
                    }
                    className={`form-textarea ${
                      errors.biography ? "error" : ""
                    }`}
                    placeholder="Tell us about yourself, your background, and what you're looking to achieve"
                    rows={4}
                    maxLength={1000}
                  />
                  {errors.biography && (
                    <span className="error-message">{errors.biography}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="profilePictureURL" className="form-label">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    id="profilePictureURL"
                    value={formData.profilePictureURL}
                    onChange={(e) =>
                      handleInputChange("profilePictureURL", e.target.value)
                    }
                    className={`form-input ${
                      errors.profilePictureURL ? "error" : ""
                    }`}
                    placeholder="https://example.com/image.jpg"
                    maxLength={200}
                  />
                  {errors.profilePictureURL && (
                    <span className="error-message">
                      {errors.profilePictureURL}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="linkedInURL" className="form-label">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    id="linkedInURL"
                    value={formData.linkedInURL}
                    onChange={(e) =>
                      handleInputChange("linkedInURL", e.target.value)
                    }
                    className={`form-input ${
                      errors.linkedInURL ? "error" : ""
                    }`}
                    placeholder="https://linkedin.com/in/yourprofile"
                    maxLength={200}
                  />
                  {errors.linkedInURL && (
                    <span className="error-message">{errors.linkedInURL}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gitHubURL" className="form-label">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="gitHubURL"
                    value={formData.gitHubURL}
                    onChange={(e) =>
                      handleInputChange("gitHubURL", e.target.value)
                    }
                    className={`form-input ${errors.gitHubURL ? "error" : ""}`}
                    placeholder="https://github.com/yourusername"
                    maxLength={200}
                  />
                  {errors.gitHubURL && (
                    <span className="error-message">{errors.gitHubURL}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Background Section */}
            <div className="form-section">
              <h2 className="section-title">Background</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="currentRole" className="form-label">
                    Current Role / Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="currentRole"
                    value={formData.currentRole}
                    onChange={(e) =>
                      handleInputChange("currentRole", e.target.value)
                    }
                    className={`form-input ${
                      errors.currentRole ? "error" : ""
                    }`}
                    placeholder="e.g., Software Developer, Student, Junior Developer"
                    maxLength={100}
                  />
                  {errors.currentRole && (
                    <span className="error-message">{errors.currentRole}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="yearsOfExperience" className="form-label">
                    Years of Experience <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      handleInputChange("yearsOfExperience", e.target.value)
                    }
                    className={`form-input ${
                      errors.yearsOfExperience ? "error" : ""
                    }`}
                    placeholder="0"
                    min="0"
                    max="50"
                  />
                  {errors.yearsOfExperience && (
                    <span className="error-message">
                      {errors.yearsOfExperience}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="educationStatus" className="form-label">
                    Education Status <span className="required">*</span>
                  </label>
                  <select
                    id="educationStatus"
                    value={formData.educationStatus}
                    onChange={(e) =>
                      handleInputChange("educationStatus", e.target.value)
                    }
                    className={`form-select ${
                      errors.educationStatus ? "error" : ""
                    }`}
                  >
                    <option value="">Select education status</option>
                    {educationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {errors.educationStatus && (
                    <span className="error-message">
                      {errors.educationStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Interests & Expertise Section */}
            <div className="form-section">
              <h2 className="section-title">Interests & Expertise</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">
                    Areas of Interest <span className="required">*</span>
                  </label>
                  <div className="multi-select-container">
                    <div className="selected-tags">
                      {formData.areasOfInterest.map((interest, index) => (
                        <span key={index} className="tag">
                          {interest}
                          <button
                            type="button"
                            onClick={() =>
                              handleMultiSelectChange(
                                "areasOfInterest",
                                formData.areasOfInterest.filter(
                                  (_, i) => i !== index
                                )
                              )
                            }
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !formData.areasOfInterest.includes(e.target.value)
                        ) {
                          handleMultiSelectChange("areasOfInterest", [
                            ...formData.areasOfInterest,
                            e.target.value,
                          ]);
                        }
                        e.target.value = "";
                      }}
                      className="form-select"
                    >
                      <option value="">Add area of interest</option>
                      {predefinedOptions.areasOfInterest
                        .filter(
                          (option) => !formData.areasOfInterest.includes(option)
                        )
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                  {errors.areasOfInterest && (
                    <span className="error-message">
                      {errors.areasOfInterest}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Programming Languages</label>
                  <div className="multi-select-container">
                    <div className="selected-tags">
                      {formData.programmingLanguages.map((lang, index) => (
                        <span key={index} className="tag">
                          {lang}
                          <button
                            type="button"
                            onClick={() =>
                              handleMultiSelectChange(
                                "programmingLanguages",
                                formData.programmingLanguages.filter(
                                  (_, i) => i !== index
                                )
                              )
                            }
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !formData.programmingLanguages.includes(
                            e.target.value
                          )
                        ) {
                          handleMultiSelectChange("programmingLanguages", [
                            ...formData.programmingLanguages,
                            e.target.value,
                          ]);
                        }
                        e.target.value = "";
                      }}
                      className="form-select"
                    >
                      <option value="">Add programming language</option>
                      {predefinedOptions.programmingLanguages
                        .filter(
                          (option) =>
                            !formData.programmingLanguages.includes(option)
                        )
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Technologies / Frameworks
                  </label>
                  <div className="multi-select-container">
                    <div className="selected-tags">
                      {formData.technologies.map((tech, index) => (
                        <span key={index} className="tag">
                          {tech}
                          <button
                            type="button"
                            onClick={() =>
                              handleMultiSelectChange(
                                "technologies",
                                formData.technologies.filter(
                                  (_, i) => i !== index
                                )
                              )
                            }
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !formData.technologies.includes(e.target.value)
                        ) {
                          handleMultiSelectChange("technologies", [
                            ...formData.technologies,
                            e.target.value,
                          ]);
                        }
                        e.target.value = "";
                      }}
                      className="form-select"
                    >
                      <option value="">Add technology</option>
                      {predefinedOptions.technologies
                        .filter(
                          (option) => !formData.technologies.includes(option)
                        )
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tools</label>
                  <div className="multi-select-container">
                    <div className="selected-tags">
                      {formData.tools.map((tool, index) => (
                        <span key={index} className="tag">
                          {tool}
                          <button
                            type="button"
                            onClick={() =>
                              handleMultiSelectChange(
                                "tools",
                                formData.tools.filter((_, i) => i !== index)
                              )
                            }
                            className="tag-remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !formData.tools.includes(e.target.value)
                        ) {
                          handleMultiSelectChange("tools", [
                            ...formData.tools,
                            e.target.value,
                          ]);
                        }
                        e.target.value = "";
                      }}
                      className="form-select"
                    >
                      <option value="">Add tool</option>
                      {predefinedOptions.tools
                        .filter((option) => !formData.tools.includes(option))
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Sticky Action Bar */}
        <div className="action-bar">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="create-profile-button"
          >
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </button>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleCloseToast}
          duration={5000}
        />
      )}
    </div>
  );
};

export default GainerProfilePage;
