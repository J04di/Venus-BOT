// src/utils/permissions.js

// Función para verificar si un usuario es el dueño del bot o un administrador
export function checkPermissions(userId) {
  // ID del dueño del bot (debe ser un ID válido de WhatsApp)
  const ownerId = 'ownerId';  // Reemplaza con tu ID de WhatsApp

  // Lista de administradores del bot (agrega los ID de los administradores)
  const admins = ['admin1', 'admin2'];  // Reemplaza con los IDs de los administradores

  // Verificación si el usuario es dueño del bot o si es un administrador
  return {
    isOwner: userId === ownerId,       // Verifica si es el dueño
    isAdmin: admins.includes(userId),  // Verifica si está en la lista de admins
  };
}

// Función para verificar si un usuario tiene permisos para ejecutar comandos de moderación
export function hasModerationPermission(userId) {
  const { isAdmin, isOwner } = checkPermissions(userId);
  return isAdmin || isOwner;  // Los administradores y el dueño pueden usar comandos de moderación
}

// Función para verificar si un usuario tiene permisos para ejecutar comandos de diversión
export function hasFunPermission(userId) {
  // Comandos de diversión los puede usar cualquier usuario, no hay restricciones
  return true;  // Todos los usuarios pueden ejecutar comandos de diversión
}

// Otras funciones de permisos adicionales que puedas necesitar
// Ejemplo para verificar permisos de comandos específicos
export function hasAdminPermission(userId) {
  const { isAdmin } = checkPermissions(userId);
  return isAdmin;  // Solo los administradores pueden ejecutar ciertos comandos
}
