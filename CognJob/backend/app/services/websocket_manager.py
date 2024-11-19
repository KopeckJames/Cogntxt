from fastapi import WebSocket
from typing import Dict, Any
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.message_queue: Dict[str, asyncio.Queue] = {}
        self.last_activity: Dict[str, datetime] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.message_queue[client_id] = asyncio.Queue()
        self.last_activity[client_id] = datetime.utcnow()
        
        # Start message processor for this client
        asyncio.create_task(self._process_messages(client_id))

    async def disconnect(self, client_id: str):
        """Disconnect a client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].close()
            del self.active_connections[client_id]
        if client_id in self.message_queue:
            del self.message_queue[client_id]
        if client_id in self.last_activity:
            del self.last_activity[client_id]

    async def send_message(self, client_id: str, message: Any):
        """Queue a message to be sent to a client."""
        if client_id in self.message_queue:
            await self.message_queue[client_id].put(message)

    async def broadcast(self, message: Any, exclude: str = None):
        """Broadcast a message to all connected clients except the excluded one."""
        for client_id in self.active_connections:
            if client_id != exclude:
                await self.send_message(client_id, message)

    async def _process_messages(self, client_id: str):
        """Process queued messages for a client."""
        try:
            while True:
                if client_id not in self.active_connections:
                    break
                
                try:
                    message = await asyncio.wait_for(
                        self.message_queue[client_id].get(),
                        timeout=30.0
                    )
                except asyncio.TimeoutError:
                    # Send ping to keep connection alive
                    await self._send_ping(client_id)
                    continue

                try:
                    websocket = self.active_connections[client_id]
                    if isinstance(message, (dict, list)):
                        await websocket.send_json(message)
                    else:
                        await websocket.send_text(str(message))
                    
                    self.last_activity[client_id] = datetime.utcnow()
                except Exception as e:
                    print(f"Error sending message to client {client_id}: {e}")
                    await self.disconnect(client_id)
                    break

        except Exception as e:
            print(f"Error in message processor for client {client_id}: {e}")
            await self.disconnect(client_id)

    async def _send_ping(self, client_id: str):
        """Send a ping message to keep the connection alive."""
        try:
            websocket = self.active_connections[client_id]
            await websocket.send_json({"type": "ping", "timestamp": datetime.utcnow().isoformat()})
        except Exception as e:
            print(f"Error sending ping to client {client_id}: {e}")
            await self.disconnect(client_id)

    def get_active_connections(self) -> list:
        """Get a list of active client IDs."""
        return list(self.active_connections.keys())

    async def cleanup_inactive(self, max_inactive_time: int = 3600):
        """Clean up inactive connections."""
        current_time = datetime.utcnow()
        for client_id, last_active in list(self.last_activity.items()):
            if (current_time - last_active).total_seconds() > max_inactive_time:
                await self.disconnect(client_id)