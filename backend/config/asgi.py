"""
ASGI Configuration — supports both HTTP and WebSockets
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from apps.alerts.consumers import AlertConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = ProtocolTypeRouter({
    # Normal HTTP requests
    'http': get_asgi_application(),

    # WebSocket connections for live alerts
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('ws/alerts/', AlertConsumer.as_asgi()),
        ])
    ),
})
