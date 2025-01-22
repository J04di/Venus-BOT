export default function (wss) {
    wss.ev.on("messages.upsert", async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message) continue;

            const body = msg.message.conversation || "";
            const chat = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderName = msg.pushName || "Desconocido";

            // Comandos de diversión
            if (body.startsWith("/kiss")) {
                const target = body.split(" ")[1]?.replace("@", "") || "alguien";
                await wss.sendMessage(chat, {
                    caption: `💋 @${sender.split("@")[0]} le dio un beso a @${target}`,
                    mentions: [sender, `${target}@s.whatsapp.net`],
                    image: { url: "https://media.giphy.com/media/l0MYOUI5XfRkzKlAc/giphy.gif" }, // Cambia la URL por un GIF de tu preferencia
                });
            }

            if (body.startsWith("/slap")) {
                const target = body.split(" ")[1]?.replace("@", "") || "alguien";
                await wss.sendMessage(chat, {
                    caption: `👋 @${sender.split("@")[0]} abofeteó a @${target} con fuerza.`,
                    mentions: [sender, `${target}@s.whatsapp.net`],
                    image: { url: "https://media.giphy.com/media/3XlEk2RxPS1m8/giphy.gif" },
                });
            }

            if (body.startsWith("/kill")) {
                const target = body.split(" ")[1]?.replace("@", "") || "alguien";
                await wss.sendMessage(chat, {
                    caption: `💀 @${sender.split("@")[0]} eliminó a @${target}. ¡Qué tragedia!`,
                    mentions: [sender, `${target}@s.whatsapp.net`],
                    image: { url: "https://media.giphy.com/media/26tPplGWjN0xLybiU/giphy.gif" },
                });
            }

            if (body.startsWith("/pat")) {
                const target = body.split(" ")[1]?.replace("@", "") || "alguien";
                await wss.sendMessage(chat, {
                    caption: `🤗 @${sender.split("@")[0]} acarició cariñosamente a @${target}.`,
                    mentions: [sender, `${target}@s.whatsapp.net`],
                    image: { url: "https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif" },
                });
            }
        }
    });
        }
