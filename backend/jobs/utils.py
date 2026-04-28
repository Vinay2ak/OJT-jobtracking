from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


def notify_user(user_id, event_type, data):
    """Send a real-time WebSocket notification to a user's channel group.
    
    Wrapped in try/except so WebSocket failures don't crash API requests.
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer is None:
            logger.warning("Channel layer is not available. Skipping WebSocket notification.")
            return
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": event_type,
                **data
            }
        )
    except Exception as e:
        logger.warning(f"WebSocket notification failed for user {user_id}: {e}")
