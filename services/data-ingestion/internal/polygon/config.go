package polygon

import "time"

type Config struct {
	APIKey        string
	ReconnectWait time.Duration
	Symbols       []string
}
