import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../../hooks/useOnboarding";
import Toast from "../../components/Toast";
import "./ChooseRole.css";

const ChooseRole = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const navigate = useNavigate();
  const { setRole } = useOnboarding();

  const roleOptions = [
    {
      id: "gainer",
      title: "Gainer",
      subtitle: "I want to gain real-world experience through projects.",
      description:
        "Perfect for students and early-career professionals looking to build their portfolio and gain hands-on experience.",
    },
    {
      id: "mentor",
      title: "Mentor",
      subtitle: "I want to guide and support others in their journey.",
      description:
        "Ideal for experienced professionals who want to share their knowledge and help others grow.",
    },
    {
      id: "nonprofit",
      title: "Non-Profit",
      subtitle:
        "I represent an organization seeking tech solutions and collaboration.",
      description:
        "Great for organizations looking for innovative technology solutions and collaborative partnerships.",
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleSubmit = () => {
    if (!selectedRole) {
      setToastMessage("Please select a role to continue.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);
    setShowToast(false);

    try {
      // Store the role locally in onboarding context
      setRole(selectedRole);

      // Show success message
      setToastMessage(
        "Role selected successfully! Redirecting to profile setup..."
      );
      setToastType("success");
      setShowToast(true);

      // Navigate to onboarding profile setup after a short delay
      setTimeout(() => {
        navigate("/onboarding/profile");
      }, 1500);
    } catch (error) {
      console.error("Failed to set role:", error);
      setToastMessage("Failed to set role. Please try again.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseToast = () => {
    setShowToast(false);
  };

  return (
    <div className="choose-role-page">
      <div className="choose-role-container">
        <div className="page-header">
          <h1 className="page-title">Choose Your Role</h1>
          <p className="page-subtitle">
            Welcome to GainIt! To set up your profile, please select the role
            that best describes you:
          </p>
        </div>

        <div className="role-grid">
          {roleOptions.map((role) => (
            <div
              key={role.id}
              className={`role-card ${
                selectedRole === role.id ? "selected" : ""
              }`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="role-content">
                <h3 className="role-title">{role.title}</h3>
                <p className="role-subtitle">{role.subtitle}</p>
                <p className="role-description">{role.description}</p>
              </div>
              {selectedRole === role.id && (
                <div className="selected-indicator">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="action-section">
          <p className="action-text">
            Select your role to continue and complete your profile setup.
          </p>
          <button
            className={`submit-button ${
              !selectedRole || isSubmitting ? "disabled" : ""
            }`}
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Continue to Profile Setup"}
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

export default ChooseRole;
