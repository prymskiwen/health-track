import { Edit, Delete, Visibility, Assignment } from "@mui/icons-material";

/**
 * Get actions for a doctor
 * @param {Object} doctor - Doctor object
 * @param {Object} handlers - Event handlers { onEdit, onDelete }
 * @returns {Array} Array of action objects with onClick handlers
 */
export const getDoctorActions = (doctor, { onEdit, onDelete }) => {
  return [
    {
      icon: <Edit />,
      label: "Edit",
      onClick: () => onEdit(doctor),
      color: "primary",
    },
    {
      icon: <Delete />,
      label: "Delete",
      onClick: () => onDelete(doctor),
      color: "error",
    },
  ];
};

/**
 * Get actions for a patient based on user role
 * @param {Object} patient - Patient object
 * @param {string} userRole - Current user's role ('admin', 'doctor', 'patient')
 * @param {Object} handlers - Event handlers { onEdit, onDelete, onAssign, onViewReports }
 * @returns {Array} Array of action objects with onClick handlers
 */
export const getPatientActions = (
  patient,
  userRole,
  { onEdit, onDelete, onAssign, onViewReports }
) => {
  const actions = [];

  // View Reports - available to all roles
  if (onViewReports) {
    actions.push({
      icon: <Visibility />,
      label: "View Reports",
      onClick: () => onViewReports(patient),
      color: "primary",
    });
  }

  // Admin and Doctor actions
  if (userRole === "doctor" || userRole === "admin") {
    // Assign Doctor - only for admin
    if (userRole === "admin" && onAssign) {
      actions.push({
        icon: <Assignment />,
        label: "Assign Doctor",
        onClick: () => onAssign(patient),
        color: "secondary",
      });
    }

    // Edit - available to admin and doctor
    if (onEdit) {
      actions.push({
        icon: <Edit />,
        label: "Edit",
        onClick: () => onEdit(patient),
        color: "success",
      });
    }

    // Delete - only for admin
    if (userRole === "admin" && onDelete) {
      actions.push({
        icon: <Delete />,
        label: "Delete",
        onClick: () => onDelete(patient),
        color: "error",
      });
    }
  }

  return actions;
};
