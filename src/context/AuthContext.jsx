import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getUsuarioActual } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null); // fila de la tabla "usuarios" (incluye rol)
  const [cargando, setCargando] = useState(true);

  async function cargarPerfil() {
    try {
      const datos = await getUsuarioActual();
      setPerfil(datos);
    } catch (err) {
      console.error("No se pudo cargar el perfil del usuario:", err.message);
      setPerfil(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) await cargarPerfil();
      setCargando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nuevaSesion) => {
      setSession(nuevaSesion);
      if (nuevaSesion) {
        await cargarPerfil();
      } else {
        setPerfil(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(correo, password) {
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password });
    if (error) throw new Error(error.message);
  }

  async function logout() {
    await supabase.auth.signOut();
    setPerfil(null);
  }

  const value = {
    session,
    usuario: session?.user || null, // usuario de Supabase Auth (tiene .email)
    perfil,                          // fila de nuestra tabla "usuarios" (tiene .id, .rol, .nombre)
    esAdmin: perfil?.rol === "admin",
    cargando,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}