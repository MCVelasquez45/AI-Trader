package storage

import (
	"context"
	"encoding/json"

	"github.com/segmentio/kafka-go"

	"github.com/ai-trader/data-ingestion/internal/normalizer"
)

type KafkaWriter struct {
	writer *kafka.Writer
}

func NewKafkaWriter(brokers string, topic string) *KafkaWriter {
	return &KafkaWriter{
		writer: &kafka.Writer{
			Addr:     kafka.TCP(brokers),
			Topic:    topic,
			Balancer: &kafka.LeastBytes{},
		},
	}
}

func (w *KafkaWriter) WriteAggregate(ctx context.Context, payload normalizer.NormalizedEquityAggregate) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return w.writer.WriteMessages(ctx, kafka.Message{Key: []byte(payload.Symbol), Value: bytes})
}

func (w *KafkaWriter) WriteOptionQuote(ctx context.Context, payload normalizer.NormalizedOptionQuote) error {
	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return w.writer.WriteMessages(ctx, kafka.Message{Key: []byte(payload.Symbol), Value: bytes})
}
