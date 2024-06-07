from flask import Flask, request, jsonify

app = Flask(__name__)

jwt_token = ""
user_id = ""


@app.route("/set_token", methods=["POST"])
def set_token():
    global jwt_token
    global user_id
    data = request.json
    print(data)
    jwt_token = data.get("token", "")
    user_id = data.get("userId", "")
    print("jwt", jwt_token)
    print("user id", user_id)
    return jsonify({"message": "Data received"})


@app.route("/get_token", methods=["GET"])
def send_data():
    return jsonify({"token": jwt_token, "userId": user_id})


if __name__ == "__main__":
    app.run(port=4000, debug=True)
