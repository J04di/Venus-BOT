import { jidNormalizedUser } from "@whiskeysockets/baileys";

// Variables de estado para funcionalidades
let antiLinkEnabled = false;
let antiAdultEnabled = false;

/**
 * Verifica si un usuario es administrador del grupo
 * @param {string} chat - ID del grupo
 * @param {string} user - ID del usuario
 * @param {object} wss - Objeto del socket
 * @returns {Promise<boolean>} - Devuelve true si el usuario es administrador
 */
async function isAdmin(chat, user, wss) {
    const metadata = await wss.groupMetadata(chat);
    const admins = metadata.participants.filter((p) => p.admin !== null).map((p) => p.id);
    return admins.includes(user);
}

export default function (wss) {
    wss.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const body = msg.message.conversation || "";
            const chat = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const isGroup = chat.endsWith("@g.us");
            const senderName = msg.pushName || "Desconocido";

            // Validación para comandos de moderación solo por administradores
            const isSenderAdmin = isGroup ? await isAdmin(chat, sender, wss) : false;
            if (!isSenderAdmin && isGroup && body.startsWith("/")) {
                await wss.sendMessage(chat, {
                    text: `❌ Solo los administradores pueden usar este comando.`,
                    mentions: [sender],
                });
                continue;
            }

            // Comando: /kick
            if (body.startsWith("/kick") && isGroup) {
                const target = body.split(" ")[1]?.replace("@", "") + "@s.whatsapp.net";
                await wss.groupParticipantsUpdate(chat, [target], "remove");
                await wss.sendMessage(chat, {
                    text: `⚠️ @${target.split("@")[0]} ha sido expulsado del grupo.`,
                    mentions: [target],
                });
            }

            // Comando: /mute
            if (body.startsWith("/mute") && isGroup) {
                const target = body.split(" ")[1]?.replace("@", "") + "@s.whatsapp.net";
                await wss.groupParticipantsUpdate(chat, [target], "demote");
                await wss.sendMessage(chat, {
                    text: `🔇 @${target.split("@")[0]} ha sido silenciado.`,
                    mentions: [target],
                });
            }

            // Comando: /unmute
            if (body.startsWith("/unmute") && isGroup) {
                const target = body.split(" ")[1]?.replace("@", "") + "@s.whatsapp.net";
                await wss.groupParticipantsUpdate(chat, [target], "promote");
                await wss.sendMessage(chat, {
                    text: `🔊 @${target.split("@")[0]} ya no está silenciado.`,
                    mentions: [target],
                });
            }

            // Comando: /delete o /del
            if (body.startsWith("/delete") || body.startsWith("/del")) {
                if (msg.message.extendedTextMessage?.contextInfo?.stanzaId) {
                    const messageId = msg.message.extendedTextMessage.contextInfo.stanzaId;
                    const participant = msg.message.extendedTextMessage.contextInfo.participant;
                    await wss.sendMessage(chat, { delete: { remoteJid: chat, fromMe: true, id: messageId, participant } });
                } else {
                    await wss.sendMessage(chat, { text: "❌ No se pudo encontrar el mensaje para eliminar." });
                }
            }

            // Comando: /enable
            if (body.startsWith("/enable")) {
                const feature = body.split(" ")[1];
                switch (feature) {
                    case "antilink":
                        antiLinkEnabled = true;
                        await wss.sendMessage(chat, { text: "✅ *Antilink* ha sido activado." });
                        break;
                    case "antiadult":
                        antiAdultEnabled = true;
                        await wss.sendMessage(chat, { text: "✅ *Antiadult* ha sido activado." });
                        break;
                    default:
                        await wss.sendMessage(chat, { text: "❌ Función desconocida. Usa `/enable antilink` o `/enable antiadult`." });
                        break;
                }
            }

            // Comando: /disable
            if (body.startsWith("/disable")) {
                const feature = body.split(" ")[1];
                switch (feature) {
                    case "antilink":
                        antiLinkEnabled = false;
                        await wss.sendMessage(chat, { text: "❌ *Antilink* ha sido desactivado." });
                        break;
                    case "antiadult":
                        antiAdultEnabled = false;
                        await wss.sendMessage(chat, { text: "❌ *Antiadult* ha sido desactivado." });
                        break;
                    default:
                        await wss.sendMessage(chat, { text: "❌ Función desconocida. Usa `/disable antilink` o `/disable antiadult`." });
                        break;
                }
            }

            // Función Antilink
            if (antiLinkEnabled && isGroup && /https?:\/\/[^\s]+/.test(body)) {
                await wss.groupParticipantsUpdate(chat, [sender], "remove");
                await wss.sendMessage(chat, {
                    text: `⚠️ @${sender.split("@")[0]} fue expulsado por enviar enlaces.`,
                    mentions: [sender],
                });
            }

            // Función Antiadult
            if (antiAdultEnabled && isGroup) {
                const hasMedia = msg.message.imageMessage || msg.message.videoMessage || msg.message.stickerMessage;
                if (hasMedia) {
                    await wss.groupParticipantsUpdate(chat, [sender], "remove");
                    await wss.sendMessage(chat, {
                        text: `⚠️ @${sender.split("@")[0]} fue expulsado por enviar contenido inapropiado.`,
                        mentions: [sender],
                    });
                }
            }
        }
    });
              }
