import ipaddress

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ip")
async def get_ip(request: Request):
    x_forwarded_for = request.headers.get("x-forwarded-for")
    if x_forwarded_for:
        for raw_ip in x_forwarded_for.split(","):
            ip = raw_ip.strip()
            try:
                if ipaddress.ip_address(ip).is_global:
                    return {"ip": ip}
            except ValueError:
                continue

    if request.client and request.client.host:
        return {"ip": request.client.host}

    return {"ip": None}


@app.get("/version")
async def get_wns_version():
    return {
        "version": "2026.03.06",
        "minimumVersion": "2026.03.06",
        "download": "https://wns.rsky.net/download",
        "updated": "2026-03-06 10点29分"
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=1004)
