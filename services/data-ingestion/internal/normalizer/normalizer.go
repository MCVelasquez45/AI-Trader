package normalizer

import (
	"time"

	"github.com/sirupsen/logrus"

	"github.com/ai-trader/data-ingestion/internal/polygon"
)

type NormalizedEquityAggregate struct {
	Symbol    string    `json:"symbol"`
	Close     float64   `json:"close"`
	High      float64   `json:"high"`
	Low       float64   `json:"low"`
	Volume    int64     `json:"volume"`
	Vwap      float64   `json:"vwap"`
	Timestamp time.Time `json:"timestamp"`
}

type NormalizedOptionQuote struct {
	Symbol    string    `json:"symbol"`
	Mid       float64   `json:"mid"`
	SpreadPct float64   `json:"spread_pct"`
	Bid       float64   `json:"bid"`
	Ask       float64   `json:"ask"`
	BidSize   int64     `json:"bid_size"`
	AskSize   int64     `json:"ask_size"`
	Timestamp time.Time `json:"timestamp"`
}

type Normalizer struct {
	logger *logrus.Logger
}

func New(logger *logrus.Logger) *Normalizer {
	return &Normalizer{logger: logger}
}

func (n *Normalizer) NormalizeEquityAggregate(msg polygon.EquityAggregate) NormalizedEquityAggregate {
	return NormalizedEquityAggregate{
		Symbol:    msg.Symbol,
		Close:     msg.Close,
		High:      msg.High,
		Low:       msg.Low,
		Volume:    msg.Volume,
		Vwap:      msg.Vwap,
		Timestamp: msg.Timestamp,
	}
}

func (n *Normalizer) NormalizeOptionQuote(msg polygon.OptionQuote) NormalizedOptionQuote {
	mid := (msg.Bid + msg.Ask) / 2
	spread := 0.0
	if mid > 0 {
		spread = (msg.Ask - msg.Bid) / mid
	}

	return NormalizedOptionQuote{
		Symbol:    msg.Symbol,
		Mid:       mid,
		SpreadPct: spread,
		Bid:       msg.Bid,
		Ask:       msg.Ask,
		BidSize:   msg.BidSize,
		AskSize:   msg.AskSize,
		Timestamp: msg.Timestamp,
	}
}
