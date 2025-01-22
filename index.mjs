import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } from "@whiskeysockets/baileys";
import { promises as fs } from "node:fs";
import path from "node:path";
import qrcodeTerminal from "qrcode-terminal";
import pino from "pino";
import chalk from "chalk";
import { checkPermissions } from './src/utils/permissions.js';
import { adminCommands } from './src/commands/admin.js';
import { moderationCommands } from './src/commands/moderation.js';
import { funCommands } from './src/commands/fun.js';

const sessionFolder = path.join(".", "WaSessions");

console.log(chalk.green.bold("Iniciando..."));
pino({
    level: "silent",
}).child({
    level: "silent",
});

async function startClient() {
  /**
   * Obtener versión de WhatsApp
   */
  const { version, isLatest } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);

  const wss = makeWASocket({
    markOnlineOnConnect: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
    },
    browser: ["Ubuntu", "Edge", "131.0.2903.86"],
    logger: pino({ level: "silent" }),
    version,
  });

  wss.ev.on("creds.update", saveCreds);

  // Manejando la conexión
  wss.ev.on("connection.update", async ({ lastDisconnect, qr, connection }) => {
    if (qr) {
      console.log(chalk.green.bold(`
╭───────────────────╼
│ ${chalk.cyan("Escanea este código QR para conectarte.")}
╰───────────────────╼`));
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      if ([DisconnectReason.loggedOut, DisconnectReason.badSession].includes(code)) {
        await fs.rm(sessionFolder, { recursive: true, force: true }).catch(() => void 0);
        process.exit(1);
      } else {
        await startClient();
      }
    }

    if (connection === "open") {
      const userJid = jidNormalizedUser(wss.user.id);
      console.log(chalk.green.bold(`
╭───────────────────╼
│ ${chalk.cyan("Conéctado con éxito")}
│- ${chalk.cyan("Usuario :")} +${chalk.white(userJid.split("@")[0])}
│- ${chalk.cyan("Versión de WhatsApp :")} ${chalk.white(version)} es la última ? ${chalk.white(isLatest)}
╰───────────────────╼`));
    }
  });

  // Manejando mensajes
  wss.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type === "notify" && messages && messages.length !== 0) {
      for (const message of messages) {
        if (message.message) {
          const sender = message.key.fromMe ? jidNormalizedUser(wss.user.id) : message.key.participant || message.key.remoteJid;
          const chat = message.key.remoteJid;
          const body = message.message.conversation || message.message.text || "not supported";
          
          console.log(chalk.green.bold(`
╭─────────< Venus Bot - Moderación >──────────╼
│ ${chalk.cyan(`Mensaje recibido`)}
│- ${chalk.cyan("Chat :")} ${chalk.white(chat)}
│- ${chalk.cyan("Usuario :")} +${chalk.white(sender.split("@")[0])}
│- ${chalk.cyan("Mensaje :")} ${chalk.white(body)}
╰╼`));

          if (body !== "not supported") {
            // Verificación de permisos
            const { isOwner, isAdmin } = checkPermissions(sender);
            const usedPrefix = body.charAt(0);
            const command = body.slice(1).split(" ")[0].toLowerCase();

            // Comandos con el prefijo "/"
            if (/^\//.test(body.trim())) {
              switch (command) {
                // Comando para generar el código QR
                case "qr":
                  if (isOwner) {
                    const { qr } = await wss.generateQR();
                    console.log(chalk.green.bold(`Nuevo QR generado: ${qr}`));
                    await wss.sendMessage(chat, { text: `Escanea este código QR para vincularte: ${qr}` });
                  } else {
                    await wss.sendMessage(chat, { text: "Solo el dueño del bot puede generar el código QR." });
                  }
                  break;

                // Comandos de Administración
                case "addrank":
                case "delrank":
                case "admins":
                  if (isOwner) {
                    await adminCommands(message, wss);
                  } else {
                    await wss.sendMessage(chat, { text: "No tienes permisos para ejecutar este comando." });
                  }
                  break;

                // Comandos de Moderación
                case "enable":
                case "disable":
                case "antilink":
                case "antiadult":
                  if (isAdmin || isOwner) {
                    await moderationCommands(message, wss);
                  } else {
                    await wss.sendMessage(chat, { text: "No tienes permisos para ejecutar este comando." });
                  }
                  break;

                // Comandos de Diversión (pueden ser usados por cualquier usuario)
                case "kick":
                case "slap":
                case "punch":
                case "kiss":
                case "kill":
                  await funCommands(message, wss);
                  break;

                // Comando por defecto (Ayuda o descripción del comando)
                default:
                  await wss.sendMessage(chat, { text: `Comando desconocido. Usa /menu para ver los comandos disponibles.` });
              }
            }
          }
        }
      }
    }
  });
}

startClient();
