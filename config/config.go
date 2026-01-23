package config

import (
	"sync"
)

type Config struct {
	Proxy         bool
	ProxyAddress  string
	ClientAddress string
}

var (
	instance *Config
	once     sync.Once
)

func GetConfig() *Config {
	once.Do(func() {
		instance = &Config{
			Proxy:         false,
			ProxyAddress:  "http://127.0.0.1:9999",
			ClientAddress: "https://wns.rsky.net",
			//ClientAddress: "http://127.0.0.1:5173",
		}
	})
	return instance
}
