package polygon

import (
	"context"
	"encoding/json"
	"os"
	"time"

	"github.com/sirupsen/logrus"
	"nhooyr.io/websocket"
)

type EquityAggregate struct {
	Symbol    string    `json:"symbol"`
	Open      float64   `json:"open"`
	Close     float64   `json:"close"`
	High      float64   `json:"high"`
	Low       float64   `json:"low"`
	Volume    int64     `json:"volume"`
	Vwap      float64   `json:"vwap"`
	Timestamp time.Time `json:"timestamp"`
}

type OptionQuote struct {
	Symbol    string    `json:"symbol"`
	Bid       float64   `json:"bid"`
	Ask       float64   `json:"ask"`
	BidSize   int64     `json:"bid_size"`
	AskSize   int64     `json:"ask_size"`
	Timestamp time.Time `json:"timestamp"`
}

type Stream struct {
	cfg               Config
	logger            *logrus.Logger
	equityHandler     func(EquityAggregate)
	optionQuoteHandle func(OptionQuote)
}

func NewStream(cfg Config, logger *logrus.Logger) *Stream {
	return &Stream{cfg: cfg, logger: logger}
}

func (s *Stream) OnEquityAggregate(handler func(EquityAggregate)) {
	s.equityHandler = handler
}

func (s *Stream) OnOptionQuote(handler func(OptionQuote)) {
	s.optionQuoteHandle = handler
}

func (s *Stream) Run(ctx context.Context) error {
	if s.shouldUseSynthetic() {
		s.logger.Info("running Polygon stream in synthetic mode")
		return s.runSynthetic(ctx)
	}

	s.logger.WithField("symbols", s.cfg.Symbols).Info("connecting to Polygon websocket")
	return s.runWebsocket(ctx)
}

func (s *Stream) shouldUseSynthetic() bool {
	if s.cfg.APIKey == "" {
		return true
	}
	if flag := os.Getenv("POLYGON_SYNTHETIC_ONLY"); flag == "1" || flag == "true" {
		return true
	}
	return false
}

func (s *Stream) runSynthetic(ctx context.Context) error {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			s.logger.Info("polygon synthetic loop shutting down")
			return ctx.Err()
		case <-ticker.C:
			s.emitSynthetic()
		}
	}
}

func (s *Stream) runWebsocket(ctx context.Context) error {
	ws, err := newWSConnection(ctx, s.cfg.APIKey)
	if err != nil {
		s.logger.WithError(err).Error("failed to create websocket connection; falling back to synthetic")
		return s.runSynthetic(ctx)
	}
	defer ws.close(websocket.StatusNormalClosure, "shutdown")

	channels := buildChannels(s.cfg.Symbols)
	if err := ws.subscribe(ctx, channels); err != nil {
		s.logger.WithError(err).Warn("subscription failed; switching to synthetic")
		return s.runSynthetic(ctx)
	}

	for {
		type rawMessage struct {
			Event string          `json:"ev"`
			Data  json.RawMessage `json:"data"`
		}

		_, data, err := ws.conn.Read(ctx)
		if err != nil {
			s.logger.WithError(err).Error("websocket read error; restarting synthetic loop")
			return s.runSynthetic(ctx)
		}

		if len(data) == 0 {
			continue
		}

		var messages []rawMessage
		if err := json.Unmarshal(data, &messages); err != nil {
			s.logger.WithError(err).Warn("invalid polygon payload")
			continue
		}

		for _, message := range messages {
			s.dispatch(message)
		}
	}
}

func (s *Stream) dispatch(message struct {
	Event string          `json:"ev"`
	Data  json.RawMessage `json:"data"`
}) {
	switch message.Event {
	case "A":
		if s.equityHandler == nil {
			return
		}
		var payload EquityAggregate
		if err := json.Unmarshal(message.Data, &payload); err != nil {
			s.logger.WithError(err).Warn("failed to decode aggregate")
			return
		}
		s.equityHandler(payload)
	case "Q", "T":
		if s.optionQuoteHandle == nil {
			return
		}
		var payload OptionQuote
		if err := json.Unmarshal(message.Data, &payload); err != nil {
			s.logger.WithError(err).Warn("failed to decode option quote")
			return
		}
		s.optionQuoteHandle(payload)
	default:
		s.logger.Debugf("unhandled polygon event %s", message.Event)
	}
}

func (s *Stream) emitSynthetic() {
	timestamp := time.Now().UTC()
	for _, symbol := range s.cfg.Symbols {
		if s.equityHandler != nil {
			s.equityHandler(EquityAggregate{
				Symbol:    symbol,
				Open:      100,
				Close:     101,
				High:      102,
				Low:       99,
				Volume:    1000,
				Vwap:      100.5,
				Timestamp: timestamp,
			})
		}
		if s.optionQuoteHandle != nil {
			s.optionQuoteHandle(OptionQuote{
				Symbol:    symbol + " 2025-01-17 150C",
				Bid:       1.2,
				Ask:       1.4,
				BidSize:   10,
				AskSize:   12,
				Timestamp: timestamp,
			})
		}
	}
}

func buildChannels(symbols []string) []string {
	channels := make([]string, 0, len(symbols)*2)
	for _, symbol := range symbols {
		channels = append(channels, "A."+symbol)
		channels = append(channels, "Q."+symbol)
	}
	if len(channels) == 0 {
		channels = append(channels, "T.*")
	}
	return channels
}
