import os
import requests
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="static", static_url_path="")

# Load config from environment or fallback
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "7161726715:AAF6_some_dummy_token")
CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "123456789")

@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/api/contact", methods=["POST"])
def contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400
            
        name = data.get("name", "").strip()
        contact_info = data.get("contact", "").strip()
        message = data.get("message", "").strip()
        
        if not name or not contact_info:
            return jsonify({"status": "error", "message": "Имя и контактные данные обязательны"}), 400
            
        # Format the Telegram notification message beautifully
        text = (
            f"🔔 *Новая заявка с портфолио BASHIR226*\n\n"
            f"👤 *Имя:* {name}\n"
            f"📞 *Связь:* {contact_info}\n"
            f"💬 *Задача:* {message if message else 'Не указана'}"
        )
        
        # Send to Telegram Bot API
        telegram_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHAT_ID,
            "text": text,
            "parse_mode": "Markdown"
        }
        
        response = requests.post(telegram_url, json=payload, timeout=10)
        
        if response.status_code == 200:
            return jsonify({"status": "success", "message": "Заявка успешно отправлена!"})
        else:
            print(f"Telegram API Error: {response.text}")
            return jsonify({"status": "error", "message": "Ошибка отправки в Telegram"}), 500
            
    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"status": "error", "message": "Внутренняя ошибка сервера"}), 500

if __name__ == "__main__":
    # Start the Flask app
    app.run(host="0.0.0.0", port=5000, debug=True)
