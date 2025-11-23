import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './index'; 
import { getUserRoleByEmail } from './API/Admin/Roles'; 

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const [loading, setLoading] = useState(true);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUser = async () => {
      console.log('ProtectedRoute: Verificando autenticación...');
      const userData = localStorage.getItem('user');
      console.log('ProtectedRoute: userData from localStorage:', userData);

      if (!userData) {
        console.log('ProtectedRoute: No hay datos de usuario en localStorage, redirigiendo a /login');
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        console.log('ProtectedRoute: parsedUser:', parsedUser);

        if (!parsedUser.email) {
          console.log('ProtectedRoute: No se encontró email en userData, redirigiendo a /login');
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          navigate('/login');
          setLoading(false);
          return;
        }

        let userRoles = parsedUser.roles || [];
        try {
          const backendRoles = await getUserRoleByEmail(parsedUser.email);
          console.log('ProtectedRoute: backendRoles:', backendRoles);
          userRoles = backendRoles;

          const updatedUser = { ...parsedUser, roles: userRoles };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          if (!user || JSON.stringify(user) !== JSON.stringify(updatedUser)) {
            console.log('ProtectedRoute: Sincronizando usuario con AuthContext');
            login(updatedUser);
          }
        } catch (error) {
          console.warn('ProtectedRoute: No se pudieron obtener roles del backend, usando roles de localStorage:', error.message);
        }

        if (requiredRole) {
          const hasRequiredRole = userRoles.some(role => {
            const roleName = typeof role === 'string' ? role.toLowerCase() : role.name.toLowerCase();
            console.log(`ProtectedRoute: Verificando rol ${roleName} contra ${requiredRole}`);
            return roleName === requiredRole;
          });

          if (!hasRequiredRole) {
            console.log(`ProtectedRoute: El usuario no tiene el rol requerido: ${requiredRole}, redirigiendo a /login`);
            navigate('/login');
            setLoading(false);
            return;
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('ProtectedRoute: Error al parsear userData:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        navigate('/login');
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate, requiredRole, user, login]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
        fontSize: '18px',
        backgroundColor: '#f0f2f5'
      }}>
        Verificando autenticación...
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;