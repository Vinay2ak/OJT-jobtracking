import json
from channels.generic.websocket import AsyncWebsocketConsumer


class JobConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time job updates."""

    async def connect(self):
        # Get user from scope (set by JWTAuthMiddleware)
        self.user = self.scope.get("user", None)

        if self.user and self.user.id:
            self.group_name = f"user_{self.user.id}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            await self.send(text_data=json.dumps({
                "event": "connected",
                "message": "Real-time connection established"
            }))
        else:
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Client can send ping/pong for keep-alive
        data = json.loads(text_data)
        if data.get("type") == "ping":
            await self.send(text_data=json.dumps({"type": "pong"}))

    # Handler for job_added events
    async def job_added(self, event):
        await self.send(text_data=json.dumps({
            "event": "job_added",
            "job": event["job"]
        }))

    # Handler for job_updated events
    async def job_updated(self, event):
        await self.send(text_data=json.dumps({
            "event": "job_updated",
            "job": event["job"]
        }))

    # Handler for job_deleted events
    async def job_deleted(self, event):
        await self.send(text_data=json.dumps({
            "event": "job_deleted",
            "job_id": event["job_id"]
        }))
