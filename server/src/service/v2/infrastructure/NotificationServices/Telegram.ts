import { IMonitor, INotificationChannel } from "../../../../db/v2/models/index.js";
import { IAlert, IMessageService } from "./IMessageService.js";
import got from "got";
import ApiError from "../../../../utils/ApiError.js";

const SERVICE_NAME = "TelegramServiceV2";
class TelegramService implements IMessageService {
	static SERVICE_NAME = SERVICE_NAME;
	constructor() {}

	private formatTelegramMessage = (alert: IAlert, chatId: string) => {
		return {
			chat_id: chatId,
			parse_mode: "Markdown",
			text: `*Status Alert*

Monitor name: *${alert.name}*
Status: *${alert.status}*
URL: *${alert.url}*
Checked at: *${alert.checkTime ? alert.checkTime.toISOString() : "N/A"}*
Alert time: *${alert.alertTime.toISOString()}*`,
		};
	};

	buildAlert = (monitor: IMonitor) => {
		const name = monitor?.name || "Unnamed monitor";
		const monitorStatus = monitor?.status || "unknown status";
		const url = monitor?.url || "no URL";
		const checkTime = monitor?.lastCheckedAt || null;
		const alertTime = new Date();
		return {
			name,
			url,
			status: monitorStatus,
			checkTime,
			alertTime,
		};
	};

	sendMessage = async (alert: IAlert, channel: INotificationChannel) => {
		const botToken = channel?.config?.botToken;
		const chatId = channel?.config?.chatId;
		if (!botToken || !chatId) {
			throw new ApiError("Telegram bot token or chat ID not configured", 400);
		}

		try {
			await got.post(`https://api.telegram.org/bot${botToken}/sendMessage`, { json: this.formatTelegramMessage(alert, chatId) });
		} catch (error) {
			console.warn("Failed to send Telegram message", error);
			return false;
		}

		return true;
	};

	testMessage = async () => {
		return true;
	};
}

export default TelegramService;
