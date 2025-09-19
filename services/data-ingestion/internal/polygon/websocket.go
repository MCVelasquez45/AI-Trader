package polygon

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"nhooyr.io/websocket"
)

type wsConnection struct {
	conn *websocket.Conn
}

func newWSConnection(ctx context.Context, apiKey string) (*wsConnection, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("missing Polygon API key")
	}

	url := os.Getenv("POLYGON_WS_URL")
	if url == "" {
		url = "wss://socket.polygon.io/stocks"
	}

	dialCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	conn, _, err := websocket.Dial(dialCtx, url, &websocket.DialOptions{
		HTTPHeader: http.Header{"Authorization": []string{"Bearer " + apiKey}},
	})
	if err != nil {
		return nil, err
	}

	return &wsConnection{conn: conn}, nil
}

func (w *wsConnection) subscribe(ctx context.Context, channels []string) error {
	payload := map[string]any{
		"action": "subscribe",
		"params": channels,
	}
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return w.conn.Write(ctx, websocket.MessageText, bytes)
}

func (w *wsConnection) close(status websocket.StatusCode, reason string) {
	_ = w.conn.Close(status, reason)
}
