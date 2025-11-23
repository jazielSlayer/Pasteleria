export const styles = {
    container: {
      color: "#fff",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      marginBottom: "30px",
      textAlign: "center",
      fontSize: "28px",
    },
    tabContainer: {
      marginBottom: "30px",
    },
    tabWrapper: {
      display: "flex",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
      padding: "4px",
    },
    tabButton: {
      flex: 1,
      padding: "12px 24px",
      border: "none",
      borderRadius: "6px",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    tabButtonActive: {
      backgroundColor: "#2196F3",
    },
    tabButtonInactive: {
      backgroundColor: "transparent",
    },
    loadingText: {
      textAlign: "center",
      fontSize: "18px",
    },
    errorMessage: {
      backgroundColor: "rgba(244, 67, 54, 0.1)",
      border: "1px solid #f44336",
      color: "#f44336",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "20px",
      textAlign: "center",
    },
    rolesTableContainer: {
      overflowX: "auto",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    tableHead: {
      backgroundColor: "#333",
    },
    tableHeader: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "left",
    },
    tableHeaderCenter: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "center",
    },
    tableRow: {
      borderBottom: "1px solid #555",
    },
    tableRowAlternate: {
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    tableCell: {
      padding: "12px",
    },
    tableCellBold: {
      padding: "12px",
      fontWeight: "bold",
    },
    tableCellCenter: {
      padding: "12px",
      textAlign: "center",
    },
    code: {
      backgroundColor: "rgba(255,255,255,0.1)",
      padding: "2px 6px",
      borderRadius: "4px",
    },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      color: "white",
      fontSize: "12px",
    },
    statusActive: {
      backgroundColor: "#4CAF50",
    },
    statusInactive: {
      backgroundColor: "#F44336",
    },
    statusDefault: {
      backgroundColor: "#4CAF50",
    },
    statusNotDefault: {
      backgroundColor: "#757575",
    },
    roleBadge: {
      padding: "2px 6px",
      borderRadius: "4px",
      backgroundColor: "#2196F3",
      color: "white",
      fontSize: "11px",
    },
    noRoleText: {
      color: "#999",
      fontSize: "12px",
    },
    manageButton: {
      padding: "6px 12px",
      backgroundColor: "#08085fff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    manageButtonDisabled: {
      padding: "6px 12px",
      backgroundColor: "#08085fff",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "not-allowed",
      fontSize: "12px",
    },
    editButton: {
      padding: "6px 12px",
      backgroundColor: "#2196F3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "8px",
      fontSize: "12px",
    },
    editButtonDisabled: {
      padding: "6px 12px",
      backgroundColor: "#2196F3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "not-allowed",
      marginRight: "8px",
      fontSize: "12px",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "8px",
      fontSize: "12px",
    },
    deleteButtonDisabled: {
      padding: "6px 12px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "not-allowed",
      marginRight: "8px",
      fontSize: "12px",
    },
    formContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      padding: "25px",
      borderRadius: "8px",
      marginTop: "20px",
    },
    formTitle: {
      marginBottom: "20px",
      fontSize: "22px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    formLabel: {
      display: "block",
      marginBottom: "5px",
      fontSize: "14px",
    },
    formInput: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #555",
      backgroundColor: "#222",
      color: "#fff",
      boxSizing: "border-box",
    },
    formInputError: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #f44336",
      backgroundColor: "#222",
      color: "#fff",
    },
    formErrorText: {
      color: "#f44336",
      fontSize: "12px",
      marginTop: "5px",
    },
    formCheckboxLabel: {
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
    },
    formCheckbox: {
      marginRight: "8px",
      transform: "scale(1.2)",
    },
    formButtonContainer: {
      display: "flex",
      gap: "10px",
    },
    submitButton: {
      padding: "12px 24px",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    submitButtonCreate: {
      backgroundColor: "#4CAF50",
    },
    submitButtonUpdate: {
      backgroundColor: "#FF9800",
    },
    submitButtonDisabled: {
      padding: "12px 24px",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "not-allowed",
      fontSize: "16px",
      fontWeight: "bold",
    },
    cancelButton: {
      padding: "12px 24px",
      backgroundColor: "#757575",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
    },
    cancelButtonDisabled: {
      padding: "12px 24px",
      backgroundColor: "#757575",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "not-allowed",
      fontSize: "16px",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginTop: "30px",
    },
    statCard: {
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
    },
    statCardRoles: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    statCardPermissions: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
    },
    statCardDefaultRoles: {
      backgroundColor: "rgba(16, 7, 77, 0.41)",
    },
    statTitle: {
      margin: "0 0 10px 0",
    },
    statTitleRoles: {
      color: "#4CAF50",
    },
    statTitlePermissions: {
      color: "#2196F3",
    },
    statTitleDefaultRoles: {
      color: "#2727b0ff",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0",
    },
    usersHeaderContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    usersHeaderTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#fff",
    },
    usersHeaderCount: {
      fontSize: "14px",
      color: "#999",
    },
    userStatCardUsers: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    userStatCardNoRole: {
      backgroundColor: "rgba(255, 152, 0, 0.2)",
    },
    userStatCardWithRole: {
      backgroundColor: "rgba(16, 13, 115, 0.45)",
    },
    userStatTitleUsers: {
      color: "#4CAF50",
    },
    userStatTitleNoRole: {
      color: "#FF9800",
    },
    userStatTitleWithRole: {
      color: "#101889ff",
    },
    noDataText: {
      padding: "20px",
      textAlign: "center",
      fontSize: "16px",
    },
  };
export const DocenteStyles = {
    container: {
      color: "#fff",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "28px",
    },
    loadingText: {
      textAlign: "center",
      fontSize: "18px",
    },
    errorText: {
      color: "red",
      textAlign: "center",
      fontSize: "16px",
    },
    tableContainer: {
      overflowX: "auto",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    tableHead: {
      backgroundColor: "#333",
    },
    tableHeader: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "left",
    },
    tableHeaderCenter: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "center",
    },
    tableRow: {
      borderBottom: "1px solid #555",
    },
    tableRowAlternate: {
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    tableCell: {
      padding: "12px",
    },
    tableCellBold: {
      padding: "12px",
      fontWeight: "bold",
    },
    tableCellCenter: {
      padding: "12px",
      textAlign: "center",
    },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      color: "white",
      fontSize: "12px",
    },
    statusPermanente: {
      backgroundColor: "#4CAF50",
    },
    statusTemporal: {
      backgroundColor: "#FF9800",
    },
    statusInterino: {
      backgroundColor: "#FF9800",
    },
    statusActive: {
      backgroundColor: "#4CAF50",
    },
    statusInactive: {
      backgroundColor: "#F44336",
    },
    editButton: {
      padding: "6px 12px",
      backgroundColor: "#2196F3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginRight: "8px",
      fontSize: "12px",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    formContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      padding: "25px",
      borderRadius: "8px",
      marginTop: "20px",
    },
    formTitle: {
      marginBottom: "20px",
      fontSize: "22px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    formLabel: {
      display: "block",
      marginBottom: "5px",
      fontSize: "14px",
    },
    formInput: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #555",
      backgroundColor: "#222",
      color: "#fff",
      boxSizing: "border-box",
    },
    formCheckboxLabel: {
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
    },
    formCheckbox: {
      marginRight: "8px",
      transform: "scale(1.2)",
    },
    formButtonContainer: {
      display: "flex",
      gap: "10px",
    },
    submitButton: {
      padding: "12px 24px",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    submitButtonCreate: {
      backgroundColor: "#4CAF50",
    },
    submitButtonUpdate: {
      backgroundColor: "#FF9800",
    },
    cancelButton: {
      padding: "12px 24px",
      backgroundColor: "#757575",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginTop: "30px",
    },
    statCard: {
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
    },
    statCardTotal: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    statCardActive: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
    },
    statCardPermanente: {
      backgroundColor: "rgba(255, 152, 0, 0.2)",
    },
    statTitle: {
      margin: "0 0 10px 0",
    },
    statTitleTotal: {
      color: "#4CAF50",
    },
    statTitleActive: {
      color: "#2196F3",
    },
    statTitlePermanente: {
      color: "#FF9800",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0",
    },
    noDataText: {
      padding: "20px",
      textAlign: "center",
      fontSize: "16px",
    },
  };

export const EstudianteStyles = {
    container: {
      color: "#fff",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "28px",
    },
    loadingText: {
      textAlign: "center",
      fontSize: "18px",
    },
    errorText: {
      color: "red",
      textAlign: "center",
      fontSize: "16px",
    },
    tableContainer: {
      overflowX: "auto",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    tableHead: {
      backgroundColor: "#333",
    },
    tableHeader: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "left",
    },
    tableRow: {
      borderBottom: "1px solid #555",
    },
    tableRowAlternate: {
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    tableCell: {
      padding: "12px",
    },
    tableCellBold: {
      padding: "12px",
      fontWeight: "bold",
    },
    statusBadge: {
      padding: "4px 8px",
      borderRadius: "4px",
      color: "white",
      fontSize: "12px",
    },
    statusActive: {
      backgroundColor: "#4CAF50",
    },
    statusInactive: {
      backgroundColor: "#F44336",
    },
    actionContainer: {
      display: "flex",
      gap: "8px",
    },
    editButton: {
      padding: "6px 12px",
      backgroundColor: "#2196F3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    formContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      padding: "25px",
      borderRadius: "8px",
      marginTop: "20px",
    },
    formTitle: {
      marginBottom: "20px",
      fontSize: "22px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    formLabel: {
      display: "block",
      marginBottom: "5px",
      fontSize: "14px",
    },
    formInput: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #555",
      backgroundColor: "#222",
      color: "#fff",
      boxSizing: "border-box",
    },
    formButtonContainer: {
      display: "flex",
      gap: "10px",
      marginTop: "20px",
    },
    submitButton: {
      padding: "12px 24px",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    submitButtonCreate: {
      backgroundColor: "#4CAF50",
    },
    submitButtonUpdate: {
      backgroundColor: "#2196F3",
    },
    cancelButton: {
      padding: "12px 24px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginTop: "30px",
    },
    statCard: {
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
    },
    statCardTotal: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    statCardActive: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
    },
    statCardInactive: {
      backgroundColor: "rgba(255, 152, 0, 0.2)",
    },
    statTitle: {
      margin: "0 0 10px 0",
    },
    statTitleTotal: {
      color: "#4CAF50",
    },
    statTitleActive: {
      color: "#2196F3",
    },
    statTitleInactive: {
      color: "#FF9800",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0",
    },
    noDataText: {
      padding: "20px",
      textAlign: "center",
      fontSize: "16px",
    },
  };
export const TallerStyles = {
    container: {
      color: "#fff",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      marginBottom: "20px",
      textAlign: "center",
      fontSize: "28px",
    },
    loadingText: {
      textAlign: "center",
      fontSize: "18px",
    },
    errorText: {
      color: "red",
      textAlign: "center",
      fontSize: "16px",
    },
    tableContainer: {
      overflowX: "auto",
      marginBottom: "30px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    tableHead: {
      backgroundColor: "#333",
    },
    tableHeader: {
      padding: "15px",
      borderBottom: "2px solid #555",
      textAlign: "left",
    },
    tableRow: {
      borderBottom: "1px solid #555",
    },
    tableRowAlternate: {
      backgroundColor: "rgba(255,255,255,0.05)",
    },
    tableCell: {
      padding: "12px",
    },
    tableCellBold: {
      padding: "12px",
      fontWeight: "bold",
    },
    actionContainer: {
      display: "flex",
      gap: "8px",
    },
    editButton: {
      padding: "6px 12px",
      backgroundColor: "#2196F3",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    formContainer: {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      padding: "25px",
      borderRadius: "8px",
      marginTop: "20px",
    },
    formTitle: {
      marginBottom: "20px",
      fontSize: "22px",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "20px",
    },
    formLabel: {
      display: "block",
      marginBottom: "5px",
      fontSize: "14px",
    },
    formInput: {
      width: "100%",
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #555",
      backgroundColor: "#222",
      color: "#fff",
      boxSizing: "border-box",
    },
    formButtonContainer: {
      display: "flex",
      gap: "10px",
    },
    submitButton: {
      padding: "12px 24px",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    submitButtonCreate: {
      backgroundColor: "#4CAF50",
    },
    submitButtonUpdate: {
      backgroundColor: "#2196F3",
    },
    cancelButton: {
      padding: "12px 24px",
      backgroundColor: "#F44336",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
    },
    statsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginTop: "30px",
    },
    statCard: {
      padding: "20px",
      borderRadius: "8px",
      textAlign: "center",
    },
    statCardTotal: {
      backgroundColor: "rgba(76, 175, 80, 0.2)",
    },
    statCardTipos: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
    },
    statTitle: {
      margin: "0 0 10px 0",
    },
    statTitleTotal: {
      color: "#4CAF50",
    },
    statTitleTipos: {
      color: "#2196F3",
    },
    statValue: {
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0",
    },
    noDataText: {
      padding: "20px",
      textAlign: "center",
      fontSize: "16px",
    },
  };
