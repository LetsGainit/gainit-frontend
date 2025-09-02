import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getAccessToken } from "../../auth/auth";
import { API_ENDPOINTS } from "../../config/api";
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

  // Monitor form data changes and clear resolved errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Check if any existing errors are now resolved
      const resolvedErrors = {};
      let hasResolvedErrors = false;

      Object.keys(errors).forEach((errorKey) => {
        if (errors[errorKey]) {
          // Check if this error is now resolved
          let isResolved = false;

          switch (errorKey) {
            case "fullName":
              isResolved =
                formData.fullName.trim().length > 0 &&
                formData.fullName.trim().length <= 100;
              break;
            case "biography":
              isResolved =
                formData.biography.trim().length > 0 &&
                formData.biography.trim().length <= 1000;
              break;
            case "currentRole":
              isResolved =
                formData.currentRole.trim().length > 0 &&
                formData.currentRole.trim().length <= 100;
              break;
            case "yearsOfExperience": {
              const numValue = parseInt(formData.yearsOfExperience);
              isResolved = !isNaN(numValue) && numValue >= 0 && numValue <= 50;
              break;
            }
            case "educationStatus":
              isResolved = formData.educationStatus.length > 0;
              break;
            case "areasOfInterest":
              isResolved =
                formData.areasOfInterest.length > 0 &&
                formData.areasOfInterest.join(", ").length <= 1000;
              break;
            case "profilePictureURL":
              isResolved =
                !formData.profilePictureURL ||
                (formData.profilePictureURL.length <= 200 &&
                  isValidUrl(formData.profilePictureURL));
              break;
            case "linkedInURL":
              isResolved =
                !formData.linkedInURL ||
                (formData.linkedInURL.length <= 200 &&
                  isValidUrl(formData.linkedInURL));
              break;
            case "gitHubURL":
              isResolved =
                !formData.gitHubURL ||
                (formData.gitHubURL.length <= 200 &&
                  isValidUrl(formData.gitHubURL));
              break;
            default:
              isResolved = true;
          }

          if (isResolved) {
            hasResolvedErrors = true;
          } else {
            resolvedErrors[errorKey] = errors[errorKey];
          }
        }
      });

      // Update errors state if any errors were resolved
      if (hasResolvedErrors) {
        setErrors(resolvedErrors);
      }
    }
  }, [formData, errors]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Real-time validation function that checks form validity without setting errors
  const isFormValid = () => {
    // Check required fields
    if (!formData.fullName.trim()) return false;
    if (!formData.biography.trim()) return false;
    if (!formData.currentRole.trim()) return false;
    if (!formData.yearsOfExperience) return false;
    if (!formData.educationStatus) return false;
    if (formData.areasOfInterest.length === 0) return false;

    // Check field length limits
    if (formData.fullName.trim().length > 100) return false;
    if (formData.biography.trim().length > 1000) return false;
    if (formData.currentRole.trim().length > 100) return false;

    // Check years of experience range
    const yearsExp = parseInt(formData.yearsOfExperience);
    if (isNaN(yearsExp) || yearsExp < 0 || yearsExp > 50) return false;

    // Check URL validity and length
    const urlFields = ["profilePictureURL", "linkedInURL", "gitHubURL"];
    for (const field of urlFields) {
      if (formData[field] && formData[field].length > 200) return false;
      if (formData[field] && !isValidUrl(formData[field])) return false;
    }

    // Check areas of interest combined length
    const combinedInterestLength = formData.areasOfInterest.join(", ").length;
    if (combinedInterestLength > 1000) return false;

    return true;
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
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
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
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }

    // Handle cross-field validation dependencies
    // If areasOfInterest changed, check if it resolves the combined length error
    if (field === "areasOfInterest" && errors.areasOfInterest) {
      const combinedLength = value.join(", ").length;
      if (combinedLength <= 1000) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.areasOfInterest;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only proceed when form is valid (use existing real-time validity logic)
    if (!isFormValid()) {
      console.log(
        "[GAINER_PROFILE] Form validation failed, submission blocked"
      );
      return;
    }

    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log(
        "[GAINER_PROFILE] Submission already in progress, ignoring click"
      );
      return;
    }

    setIsSubmitting(true);
    console.log("[GAINER_PROFILE] Starting profile submission process");

    try {
      // Retrieve JWT access token from Azure AD B2C auth layer
      const token = await getAccessToken();
      console.log("[GAINER_PROFILE] JWT token acquired successfully");

      // Resolve server user ID via GET /api/users/me
      console.log(
        "[GAINER_PROFILE] Resolving server user ID via /api/users/me"
      );
      const meResponse = await fetch(API_ENDPOINTS.USERS_ME(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!meResponse.ok) {
        throw new Error(
          `Failed to resolve user ID: ${meResponse.status} ${meResponse.statusText}`
        );
      }

      const meData = await meResponse.json();
      const userId = meData.userId;

      // Validate userId is non-empty
      if (!userId || typeof userId !== "string" || userId.trim() === "") {
        throw new Error("Invalid user ID received from server");
      }

      console.log("[GAINER_PROFILE] Resolved server userId:", userId);

      // Construct payload according to specifications
      const payload = {
        // Common required fields
        fullName: formData.fullName.trim(),
        biography: formData.biography.trim(),

        // Common optional fields (omit if empty)
        ...(formData.linkedInURL.trim() && {
          linkedInURL: formData.linkedInURL.trim(),
        }),
        ...(formData.gitHubURL.trim() && {
          gitHubURL: formData.gitHubURL.trim(),
        }),
        ...(formData.profilePictureURL.trim() && {
          profilePictureURL: formData.profilePictureURL.trim(),
        }),

        // Gainer required fields
        currentRole: formData.currentRole.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience),
        educationStatus: formData.educationStatus,
        areasOfInterest: formData.areasOfInterest,

        // Expertise optional fields (include only if non-empty arrays)
        ...(formData.programmingLanguages.length > 0 && {
          programmingLanguages: formData.programmingLanguages,
        }),
        ...(formData.technologies.length > 0 && {
          technologies: formData.technologies,
        }),
        ...(formData.tools.length > 0 && { tools: formData.tools }),
      };

      console.log("[GAINER_PROFILE] Payload constructed:", {
        fullName: payload.fullName,
        biography: payload.biography,
        currentRole: payload.currentRole,
        yearsOfExperience: payload.yearsOfExperience,
        educationStatus: payload.educationStatus,
        areasOfInterest: payload.areasOfInterest,
        hasLinkedIn: !!payload.linkedInURL,
        hasGitHub: !!payload.gitHubURL,
        hasProfilePicture: !!payload.profilePictureURL,
        hasProgrammingLanguages: !!payload.programmingLanguages,
        hasTechnologies: !!payload.technologies,
        hasTools: !!payload.tools,
      });

      // Build request URL using resolved userId
      const url = API_ENDPOINTS.GAINER_PROFILE(userId);
      console.log("[GAINER_PROFILE] Submitting to:", url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[GAINER_PROFILE] Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (response.ok) {
        console.log("[GAINER_PROFILE] Profile creation/update successful");

        // Parse response to get updated profile data
        let profileData;
        try {
          profileData = await response.json();
          console.log("[GAINER_PROFILE] Profile data received:", {
            id: profileData.id,
            fullName: profileData.fullName,
            hasAreasOfInterest: !!profileData.areasOfInterest?.length,
          });
        } catch {
          console.warn(
            "[GAINER_PROFILE] Failed to parse response, using form data"
          );
          profileData = payload;
        }

        // Update user context and mark user as Gainer
        try {
          await refreshUserData();
          console.log("[GAINER_PROFILE] User data refreshed successfully");
        } catch (refreshError) {
          console.warn(
            "[GAINER_PROFILE] Failed to refresh user data:",
            refreshError
          );
        }

        // Show success feedback and navigate
        setToastMessage("Profile created successfully! Redirecting to home...");
        setToastType("success");
        setShowToast(true);

        // Navigate to home after a short delay
        setTimeout(() => {
          console.log("[GAINER_PROFILE] Navigating to home...");
          navigate("/");
        }, 1500);
      } else {
        // Handle different error status codes
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { message: `HTTP ${response.status}: ${errorText}` };
        }

        if (response.status === 400 || response.status === 422) {
          console.log(
            "[GAINER_PROFILE] Validation errors received:",
            errorData.errors
          );

          // Map backend field errors to inline messages
          if (errorData.errors) {
            const backendErrors = {};
            Object.keys(errorData.errors).forEach((key) => {
              backendErrors[key] = errorData.errors[key];
            });
            setErrors(backendErrors);
          }

          setToastMessage("Please fix the errors below and try again.");
          setToastType("error");
          setShowToast(true);
        } else if (response.status === 401 || response.status === 403) {
          console.log(
            "[GAINER_PROFILE] Authentication/authorization error:",
            response.status
          );

          // Attempt silent token refresh
          try {
            await refreshUserData();
            console.log("[GAINER_PROFILE] Token refresh attempted");
            setToastMessage("Authentication expired. Please try again.");
            setToastType("error");
            setShowToast(true);
          } catch {
            console.log(
              "[GAINER_PROFILE] Token refresh failed, redirecting to sign-in"
            );
            setToastMessage("Authentication failed. Please sign in again.");
            setToastType("error");
            setShowToast(true);
            // Redirect to sign-in after delay
            setTimeout(() => {
              navigate("/signin");
            }, 2000);
          }
        } else {
          // Handle 5xx and other errors
          console.error(
            "[GAINER_PROFILE] Server error:",
            response.status,
            errorData.message
          );
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        }
      }
    } catch (error) {
      console.error("[GAINER_PROFILE] Request failed:", {
        name: error.name,
        message: error.message,
        isNetworkError:
          error.name === "TypeError" && error.message.includes("fetch"),
      });

      // Handle different error types
      if (error.message.includes("401") || error.message.includes("403")) {
        setToastMessage("Authentication failed. Please sign in again.");
        setToastType("error");
        setShowToast(true);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        setToastMessage(
          "Network error. Please check your connection and try again."
        );
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
      console.log(
        "[GAINER_PROFILE] Form submission completed, re-enabling button"
      );
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
            disabled={isSubmitting || !isFormValid()}
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
