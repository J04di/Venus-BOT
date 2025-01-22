import { makeWASocket } from "@whiskeysockets/baileys";
import { admins } from '../config/settings.js';

export const adminCommands = async (message, wss) => {
  const { chat, sender } = message;
  const command = message.body.trim().split(' ')[0].toLowerCase();

  // Comprobamos si el usuario es el dueño o un administrador
  const isOwner = admins.owner.includes(sender);
  const isAdmin = admins.admins.includes(sender);

  // Comando para agregar un rango
  if (command === '/addrank' && isOwner) {
    const rank = message.body.trim().split(' ')[1];
    if (!rank) {
      return await wss.sendMessage(chat, { text: "Por favor, indique el rango que desea agregar." });
    }
    admins.admins.push(rank);
    return await wss.sendMessage(chat, { text: `Rango ${rank} agregado con éxito.` });
  }

  // Comando para eliminar un rango
  if (command === '/delrank' && isOwner) {
    const rank = message.body.trim().split(' ')[1];
    if (!rank || !admins.admins.includes(rank)) {
      return await wss.sendMessage(chat, { text: "Rango no encontrado." });
    }
    const index = admins.admins.indexOf(rank);
    admins.admins.splice(index, 1);
    return await wss.sendMessage(chat, { text: `Rango ${rank} eliminado con éxito.` });
  }

  // Comando para ver los administradores
  if (command === '/admins' && isOwner) {
    return await wss.sendMessage(chat, { text: `Administradores actuales: ${admins.admins.join(', ')}` });
  }

  // Comando no autorizado
  if (!isOwner && !isAdmin) {
    return await wss.sendMessage(chat, { text: "No tienes permisos para usar este comando." });
  }
};
