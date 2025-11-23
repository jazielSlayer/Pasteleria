export const logo = "/logousb.png";

export const LogoStyles = {
  height: "40px", display: "block", margin: "0 auto" 
};

export const navStyle = {
  background: "#07053b8e",
  borderRadius: "8px",
  padding: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

export const ulStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  padding: "0.3rem ",
  borderRadius: "4px",
  transition: "background-color 0.3s",
};

export const buttonStyle = {
  ...linkStyle,
  background: "none",
  border: "none",
  borderRadius:'2px',
  cursor: "pointer",
  fontSize: "inherit",
  fontFamily: "inherit",
};

export const logoutButtonStyle = {
  ...buttonStyle,
  
  backgroundColor: "#b81422ff",
  color: "#fff",
};