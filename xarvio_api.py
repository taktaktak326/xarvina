from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import urllib.parse
import requests
from fastapi.middleware.cors import CORSMiddleware

# ✅ FastAPIは1回だけ作成！
app = FastAPI()

# ✅ CORS設定はこの1回目のappに対して設定する
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# エンドポイント
BASE_LOGIN_URL = "https://accounts.eu1.gigya.com/accounts.login"
TOKEN_API_URL = "https://fm-api.xarvio.com/api/users/tokens"
GRAPHQL_END_POINT = "https://fm-api.xarvio.com/api/graphql/data"
API_KEY = "3_W-AXsoj7TvX-9gi7S-IGxXfLWVkEbnGSl57M7t49GN538umaKs2EID8hyipAux2y"

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/farms")
def get_farms_api(request: LoginRequest):
    try:
        encoded_email = urllib.parse.quote(request.email)
        encoded_password = urllib.parse.quote(request.password)
        login_url = (
            f"{BASE_LOGIN_URL}?include=emails,profile,data,sessionInfo"
            f"&loginID={encoded_email}&password={encoded_password}&apiKey={API_KEY}"
        )
        login_resp = requests.get(login_url)
        login_resp.raise_for_status()
        login_data = login_resp.json()

        login_token = login_data["sessionInfo"]["cookieValue"]
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Cookie": f"LOGIN_TOKEN={login_token}"
        }
        payload = {
            "gigyaUuid": login_data["UID"],
            "gigyaUuidSignature": login_data["UIDSignature"],
            "gigyaSignatureTimestamp": login_data["signatureTimestamp"]
        }
        df_resp = requests.post(TOKEN_API_URL, json=payload, headers=headers)
        df_resp.raise_for_status()
        df_token = df_resp.json()["token"]

        headers = {
            "Accept": "*/*",
            "Content-Type": "application/json",
            "Cookie": f"LOGIN_TOKEN={login_token}; DF_TOKEN={df_token}"
        }
        farms_payload = {
            "operationName": "FarmsOverview",
            "variables": {},
            "query": """
                query FarmsOverview {
                    farms: farmsV2(uuids: []) {
                        uuid
                        name
                    }
                }
            """
        }
        farms_resp = requests.post(GRAPHQL_END_POINT, json=farms_payload, headers=headers)
        farms_resp.raise_for_status()
        farms = farms_resp.json()["data"]["farms"]
        return farms

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
