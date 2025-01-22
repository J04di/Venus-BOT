export default function (wss) {
    wss.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const body = msg.message.conversation || "";
            const chat = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderName = msg.pushName || "Desconocido";

            // Comando: /menu (Acción general de menú)
            if (body.startsWith("/menu")) {
                const menuMessage = `
*Menú de Comandos:*

1. /menu - Muestra el menú de comandos.
2. /say [texto] - El bot repetirá el texto que pongas.
3. /help - Muestra la lista de comandos disponibles.

*Comandos de Moderación (Solo Admins):*
1. /kick [@usuario] - Expulsar a un usuario del grupo.
2. /mute [@usuario] - Silenciar a un usuario del grupo.
3. /unmute [@usuario] - Desilenciar a un usuario.
4. /enable [función] - Activar una función de moderación.
5. /disable [función] - Desactivar una función de moderación.
6. /delete [mensaje] - Eliminar un mensaje.

*Comandos de Diversión:*
1. /punch [@usuario] - Golpear a un usuario.
2. /kiss [@usuario] - Besar a un usuario.
3. /hug [@usuario] - Abrazar a un usuario.
4. /bite [@usuario] - Morder a un usuario.
5. /dance [@usuario] - Hacer bailar a un usuario.
`;

                await wss.sendMessage(chat, {
                    text: menuMessage,
                    mentions: [sender],
                });
            }

            // Comando: /say
            if (body.startsWith("/say")) {
                const text = body.split(" ").slice(1).join(" ");
                if (!text) {
                    await wss.sendMessage(chat, { text: "❌ Debes escribir algo después del comando." });
                    continue;
                }

                await wss.sendMessage(chat, {
                    text: text,
                    mentions: [sender],
                });
            }

            // Comando: /help (Muestra la ayuda con todos los comandos disponibles)
            if (body.startsWith("/help")) {
                const helpMessage = `
*Ayuda - Comandos Disponibles:*

1. /menu - Muestra todos los comandos disponibles.
2. /say [texto] - Repite lo que pongas después de /say.
3. /help - Muestra este mensaje de ayuda.

*Comandos de Moderación (Solo Admins):*
1. /kick [@usuario] - Expulsar a un usuario.
2. /mute [@usuario] - Silenciar a un usuario.
3. /unmute [@usuario] - Desilenciar a un usuario.
4. /enable [función] - Activar una función de moderación.
5. /disable [función] - Desactivar una función de moderación.
6. /delete [mensaje] - Eliminar un mensaje.

*Comandos de Diversión:*
1. /punch [@usuario] - Golpear a un usuario.
2. /kiss [@usuario] - Besar a un usuario.
3. /hug [@usuario] - Abrazar a un usuario.
4. /bite [@usuario] - Morder a un usuario.
5. /dance [@usuario] - Hacer bailar a un usuario.
`;

                await wss.sendMessage(chat, {
                    text: helpMessage,
                    mentions: [sender],
                });
            }

            // Comando: /delete (Eliminar un mensaje específico)
            if (body.startsWith("/delete") || body.startsWith("/del")) {
                if (msg.quotedMessage) {
                    await wss.sendMessage(chat, { delete: msg.quotedMessage.key });
                    await wss.sendMessage(chat, { text: "✔️ El mensaje ha sido eliminado correctamente." });
                } else {
                    await wss.sendMessage(chat, { text: "❌ No se especificó un mensaje para eliminar." });
                }
            }
        }
    });
        } 
