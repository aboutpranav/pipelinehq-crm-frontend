import { useState } from "react";
import { toast } from "react-toastify";
import "./Settings.css";

const Settings = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin",
    email: "admin@example.com",
    role: "sales_agent",
    notifications: true,
    emailAlerts: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    console.log("Settings saved:", formData);
    setShowAlert(true);

    toast.success("💾 Settings saved successfully!");

    setTimeout(() => setShowAlert(false), 3000);
  };

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        {showAlert && (
          <div className="settings-alert">
            <span>✅</span>
            <span>Settings saved successfully!</span>
          </div>
        )}

        <div className="settings-header">
          <div className="settings-header-content">
            <div>
              <h1 className="settings-header-title">⚙️ Settings</h1>
              <p className="settings-header-subtitle">
                Manage your account preferences and system configuration.
              </p>
            </div>
            <button className="settings-save-btn" onClick={handleSave}>
              💾 Save Changes
            </button>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-card">
            <div className="settings-card-header">
              <div
                className="settings-card-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                <span>👤</span>
              </div>
              <div>
                <h5 className="settings-card-title">Personal Information</h5>
                <p className="settings-card-subtitle">
                  Update your personal details
                </p>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-form-group">
                <label className="settings-form-label">Full Name</label>
                <input
                  type="text"
                  className="settings-form-input"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Email Address</label>
                <input
                  type="email"
                  className="settings-form-input"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Role</label>
                <select
                  className="settings-form-select"
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option value="sales_agent">Sales Agent</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-card-header">
              <div
                className="settings-card-icon"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                }}
              >
                <span>🔔</span>
              </div>
              <div>
                <h5 className="settings-card-title">Notification Settings</h5>
                <p className="settings-card-subtitle">
                  Control your notification preferences
                </p>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="settings-toggle-item">
                <div className="settings-toggle-info">
                  <span className="settings-toggle-title">
                    Email Notifications
                  </span>
                  <small className="settings-toggle-description">
                    Receive updates and alerts via email
                  </small>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) =>
                      handleChange("notifications", e.target.checked)
                    }
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>

              <div className="settings-toggle-item">
                <div className="settings-toggle-info">
                  <span className="settings-toggle-title">
                    Alert Notifications
                  </span>
                  <small className="settings-toggle-description">
                    Get notified about important system alerts
                  </small>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={formData.emailAlerts}
                    onChange={(e) =>
                      handleChange("emailAlerts", e.target.checked)
                    }
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
