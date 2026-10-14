
from flask import Flask, request, jsonify
from flask_cors import CORS
from preprocessor import process
import helper

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Maximum upload size: 16 MB
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "WhatsApp Chat Analyzer API is running!"
    })


@app.route("/upload", methods=["POST"])
def upload_chat():
    # Check whether a file was sent
    if "file" not in request.files:
        return jsonify({
            "error": "No file was uploaded."
        }), 400

    file = request.files["file"]

    # Check whether a file was selected
    if not file.filename:
        return jsonify({
            "error": "Please select a file."
        }), 400

    # Accept only .txt files
    if not file.filename.lower().endswith(".txt"):
        return jsonify({
            "error": "Please upload a WhatsApp .txt export."
        }), 400

    try:
        # Read in memory; do not save the chat to disk
        file_bytes = file.read()

        if not file_bytes:
            return jsonify({
                "error": "The uploaded file is empty."
            }), 400

        # WhatsApp exports can use different text encodings
        try:
            chat_text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            chat_text = file_bytes.decode("utf-16")

        if not chat_text.strip():
            return jsonify({
                "error": "The uploaded file contains no readable text."
            }), 400

        # Temporary response: confirms that upload works
        return jsonify({
            "message": "File received successfully!",
            "filename": file.filename,
            "line_count": len(chat_text.splitlines()),
            "characters": len(chat_text)
        }), 200

    except UnicodeDecodeError:
        return jsonify({
            "error": "The file encoding could not be read."
        }), 400


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "error": "File is too large. Maximum size is 16 MB."
    }), 413


@app.route("/analyze", methods=["POST"])
def analyze_chat():
    if "file" not in request.files:
        return jsonify({"error": "No file was uploaded."}), 400

    file = request.files["file"]

    if not file.filename or not file.filename.lower().endswith(".txt"):
        return jsonify({"error": "Please upload a WhatsApp .txt file."}), 400

    try:
        file_bytes = file.read()

        try:
            chat_text = file_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            chat_text = file_bytes.decode("utf-16")

        df = process(chat_text)
        
        selected_user = request.form.get("selected_user", "Overall")

        print("Selected user:", repr(selected_user))
        print("Total parsed messages:", len(df))
        print("Participants:", df["user"].value_counts().head(5).to_dict())


        if df.empty:
            return jsonify({"error": "No messages could be parsed."}), 400

        total_messages, total_words, media_messages, total_links = (
            helper.fetch_stats(selected_user, df)
        )

        busy_users, user_stats = helper.most_busy_users(df)
        monthly = helper.monthly_timeline(selected_user, df)
        
        emojis = helper.emoji_counts(selected_user, df)
        common_words = helper.most_common_words(selected_user, df)
        weekdays = helper.weekday_activity(selected_user, df)
        daily = helper.daily_timeline(selected_user, df)
        hourly = helper.hourly_activity(selected_user, df)
        heatmap = helper.activity_heatmap(selected_user, df)




        return jsonify({
            "filename": file.filename,
            "stats": {
                "total_messages": int(total_messages),
                "total_words": int(total_words),
                "media_messages": int(media_messages),
                "total_links": int(total_links)
            },
            "most_active_users": [
                {"user": str(user), "messages": int(count)}
                for user, count in busy_users.items()
            ],
            "user_message_percentages": user_stats.to_dict(orient="records"),
            "monthly_timeline": monthly[["time", "message_count"]].to_dict(orient="records"),
            "top_emojis": [
                {"emoji": str(row["emoji"]), "count": int(row["count"])}
                for _, row in emojis.head(10).iterrows()
            ],
            "common_words": [
                {"word": str(word), "count": int(count)}
                for word, count in common_words
            ],
            "weekday_activity": weekdays,
            "daily_timeline": daily,
            "hourly_activity": hourly,
            "activity_heatmap": heatmap,


        }), 200

    except UnicodeDecodeError:
        return jsonify({"error": "The file encoding could not be read."}), 400
    except Exception as error:
        app.logger.exception("Chat analysis failed")
        return jsonify({"error": f"Analysis failed: {str(error)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
