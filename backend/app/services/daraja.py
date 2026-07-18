import base64
import requests
from datetime import datetime
from app.config import settings

SANDBOX_BASE_URL = "https://sandbox.safaricom.co.ke"
PRODUCTION_BASE_URL = "https://api.safaricom.co.ke"

def get_base_url() -> str:
    return PRODUCTION_BASE_URL if settings.daraja_env == "production" else SANDBOX_BASE_URL

def get_access_token() -> str:
    url = f"{get_base_url()}/oauth/v1/generate?grant_type=client_credentials"
    response = requests.get(
        url,
        auth=(settings.daraja_consumer_key, settings.daraja_consumer_secret),
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["access_token"]

def generate_password_and_timestamp() -> tuple[str, str]:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    raw = f"{settings.daraja_shortcode}{settings.daraja_passkey}{timestamp}"
    password = base64.b64encode(raw.encode()).decode()
    return password, timestamp

def initiate_stk_push(phone_number: str, amount: int, account_reference: str, callback_url: str) -> dict:
    """
    phone_number must be in format 2547XXXXXXXX (no leading + or 0)
    """
    token = get_access_token()
    password, timestamp = generate_password_and_timestamp()

    url = f"{get_base_url()}/mpesa/stkpush/v1/processrequest"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "BusinessShortCode": settings.daraja_shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": settings.daraja_shortcode,
        "PhoneNumber": phone_number,
        "CallBackURL": callback_url,
        "AccountReference": account_reference,
        "TransactionDesc": "Blueswitch POS payment",
    }
    response = requests.post(url, json=payload, headers=headers, timeout=15)
    response.raise_for_status()
    return response.json()
