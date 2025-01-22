export default function (wss) {
    wss.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const body = msg.message.conversation || "";
            const chat = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderName = msg.pushName || "Desconocido";

            // Comando: /menu
            if (body.startsWith("/menu")) {
                const menu = `
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
                    text: menu,
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

            // Comando: /help
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
1. /punch - Golpear a un usuario.
2. /kiss - Besar a un usuario.
3. /hug - Abrazar a un usuario.
4. /bite - Morder a un usuario.
5. /dance - Hacer bailar a un usuario.
`;

                await wss.sendMessage(chat, {
                    text: helpMessage,
                    mentions: [sender],
                });
            }

            // Comandos de Diversión

            // Comando: /punch
            if (body.startsWith("/punch") && body.split(" ")[1]) {
                const mentionedUser = body.split(" ")[1].replace('@', '');
                const punchMessage = `💥 *${senderName} acaba de golpear a @${mentionedUser}! Ouch!*`;
                await wss.sendMessage(chat, {
                    text: punchMessage,
                    mentions: [mentionedUser],
                });
                // Se puede agregar GIF usando algún enlace de Giphy o similar:
                // await wss.sendMessage(chat, { image: { url: "https://giphy.com/punch_gif_link" }, caption: punchMessage });
            }

            // Comando: /kiss
            if (body.startsWith("/kiss") && body.split(" ")[1]) {
                const mentionedUser = body.split(" ")[1].replace('@', '');
                const kissMessage = `💋 *${senderName} acaba de besar a @${mentionedUser}! Qué tierno!*`;
                await wss.sendMessage(chat, {
                    text: kissMessage,
                    mentions: [mentionedUser],
                });
                // GIF ejemplo:
                // await wss.sendMessage(chat, { image: { url: "https://giphy.com/kiss_gif_link" }, caption: kissMessage });
            }

            // Comando: /hug
            if (body.startsWith("/hug") && body.split(" ")[1]) {
                const mentionedUser = body.split(" ")[1].replace('@', '');
                const hugMessage = `🤗 *${senderName} acaba de abrazar a @${mentionedUser}! Un abrazo cálido.*`;
                await wss.sendMessage(chat, {
                    text: hugMessage,
                    mentions: [mentionedUser],
                });
                // GIF ejemplo:
                // await wss.sendMessage(chat, { image: { url: "https://giphy.com/hug_gif_link" }, caption: hugMessage });
            }

            // Comando: /bite
            if (body.startsWith("/bite") && body.split(" ")[1]) {
                const mentionedUser = body.split(" ")[1].replace('@', '');
                const biteMessage = `😈 *${senderName} acaba de morder a @${mentionedUser}! ¡Aouch!*`;
                await wss.sendMessage(chat, {
                    text: biteMessage,
                    mentions: [mentionedUser],
                });
                // GIF ejemplo:
                // await wss.sendMessage(chat, { image: { url: "https://giphy.com/bite_gif_link" }, caption: biteMessage });
            }

            // Comando: /dance
            if (body.startsWith("/dance") && body.split(" ")[1]) {
                const mentionedUser = body.split(" ")[1].replace('@', '');
                const danceMessage = `💃 *${senderName} hizo bailar a @${mentionedUser}! ¡Qué ritmo!*`;
                await wss.sendMessage(chat, {
                    text: danceMessage,
                    mentions: [mentionedUser],
                });
                // GIF ejemplo:
                // await wss.sendMessage(chat, { image: { url: "https://giphy.com/dance_gif_link" }, caption: danceMessage });
            }
        }
    });
                    } 
