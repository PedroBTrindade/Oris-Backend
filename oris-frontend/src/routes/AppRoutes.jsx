import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Páginas públicas (sem login)
import Login from '../pages/Login/Login';
import Cadastro from '../pages/Cadastro/Cadastro';

// Páginas do usuário (requerem login)
import Home from '../pages/Home/Home';
import Jornada from '../pages/Jornada/Jornada';
import Configuracoes from '../pages/Configuracoes/Configuracoes';

// Páginas do admin (requerem admin)
import AdminDashboard from '../pages/Admin/AdminDashboard';

/**
 * RotaProtegida: redireciona para login se o usuário não estiver autenticado.
 */
function RotaProtegida({ children }) {
  const { estaLogado } = useAuth();

  if (!estaLogado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * RotaAdmin: redireciona para home se o usuário não for administrador.
 */
function RotaAdmin({ children }) {
  const { estaLogado, eAdmin } = useAuth();

  if (!estaLogado) return <Navigate to="/login" replace />;
  if (!eAdmin) return <Navigate to="/home" replace />;

  return children;
}

/**
 * RotaPublica: redireciona para a página correta se já estiver logado.
 * Admin vai para /admin, usuário comum vai para /home.
 */
function RotaPublica({ children }) {
  const { estaLogado, eAdmin } = useAuth();

  if (estaLogado) {
    return <Navigate to={eAdmin ? '/admin' : '/home'} replace />;
  }

  return children;
}

/**
 * AppRoutes: define todas as rotas da aplicação ORIS.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota raiz — redireciona conforme estado de login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas públicas (sem autenticação) */}
        <Route
          path="/login"
          element={
            <RotaPublica>
              <Login />
            </RotaPublica>
          }
        />
        <Route
          path="/cadastro"
          element={
            <RotaPublica>
              <Cadastro />
            </RotaPublica>
          }
        />

        {/* Rotas do usuário comum */}
        <Route
          path="/home"
          element={
            <RotaProtegida>
              <Home />
            </RotaProtegida>
          }
        />
        <Route
          path="/jornada"
          element={
            <RotaProtegida>
              <Jornada />
            </RotaProtegida>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <RotaProtegida>
              <Configuracoes />
            </RotaProtegida>
          }
        />

        {/* Rotas do administrador */}
        <Route
          path="/admin"
          element={
            <RotaAdmin>
              <AdminDashboard />
            </RotaAdmin>
          }
        />

        {/* Rota 404 — qualquer URL não mapeada volta para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
