from __future__ import annotations

import smtplib
from email.message import EmailMessage

from twilio.rest import Client


def send_email(cfg: dict, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = cfg["email_from"]
    msg["To"] = cfg["email_to"]
    msg.set_content(body)

    with smtplib.SMTP(cfg["host"], cfg["port"], timeout=20) as server:
        server.starttls()
        server.login(cfg["user"], cfg["password"])
        server.send_message(msg)


def send_sms(cfg: dict, body: str) -> None:
    client = Client(cfg["account_sid"], cfg["auth_token"])
    client.messages.create(body=body, from_=cfg["from"], to=cfg["to"])
