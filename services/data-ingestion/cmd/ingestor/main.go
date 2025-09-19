package main

import (
	"context"
	"os"
	"strings"
	"time"

	"github.com/sirupsen/logrus"

	"github.com/ai-trader/data-ingestion/internal/normalizer"
	"github.com/ai-trader/data-ingestion/internal/polygon"
	"github.com/ai-trader/data-ingestion/internal/storage"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})

	symbols := parseSymbols(os.Getenv("POLYGON_SYMBOLS"))
	if len(symbols) == 0 {
		symbols = []string{"AAPL", "MSFT"}
	}

	cfg := polygon.Config{
		APIKey:        os.Getenv("POLYGON_API_KEY"),
		ReconnectWait: 5 * time.Second,
		Symbols:       symbols,
	}

	redisStore := storage.NewRedisStore(mustEnv("REDIS_URI"))
	kafkaWriter := storage.NewKafkaWriter(mustEnv("KAFKA_BROKERS"), "market-data")
	s3Sink := storage.NewS3Sink(mustEnv("S3_BUCKET"))

	normalizer := normalizer.New(logger)
	stream := polygon.NewStream(cfg, logger)

	stream.OnEquityAggregate(func(msg polygon.EquityAggregate) {
		payload := normalizer.NormalizeEquityAggregate(msg)
		if err := redisStore.StoreAggregate(ctx, payload); err != nil {
			logger.WithError(err).Warn("failed to write aggregate to redis")
		}
		if err := kafkaWriter.WriteAggregate(ctx, payload); err != nil {
			logger.WithError(err).Error("failed to publish aggregate to kafka")
		}
		if err := s3Sink.Archive(ctx, payload); err != nil {
			logger.WithError(err).Warn("failed to archive aggregate")
		}
	})

	stream.OnOptionQuote(func(msg polygon.OptionQuote) {
		payload := normalizer.NormalizeOptionQuote(msg)
		if err := redisStore.StoreQuote(ctx, payload); err != nil {
			logger.WithError(err).Warn("failed to write option quote")
		}
		if err := kafkaWriter.WriteOptionQuote(ctx, payload); err != nil {
			logger.WithError(err).Error("failed to publish option quote")
		}
	})

	if err := stream.Run(ctx); err != nil {
		logger.WithError(err).Fatal("ingestion stopped")
	}
}

func mustEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		logrus.Fatalf("missing required env %s", key)
	}
	return value
}

func parseSymbols(raw string) []string {
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	var symbols []string
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			symbols = append(symbols, strings.ToUpper(trimmed))
		}
	}
	return symbols
}
