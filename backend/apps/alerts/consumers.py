import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AlertConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer — pushes live alerts to connected counselors/admins.
    Connect: ws://localhost:8000/ws/alerts/
    """
    async def connect(self):
        self.user = self.scope['user']
        self.group_name = f"alerts_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_alert(self, event):
        """Called by Django when a new alert is created."""
        await self.send(text_data=json.dumps(event['data']))
