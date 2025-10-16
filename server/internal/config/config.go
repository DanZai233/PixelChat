package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                    string
	GinMode                 string
	CORSOrigin              string
	RateLimitWindowSeconds  int
	RateLimitMaxRequests    int
	MaxMessageLength        int
	MaxMessagesHistory      int
	MaxUsersPerRoom         int
	UserTimeoutSeconds      int
}

func Load() *Config {
	return &Config{
		Port:                    getEnv("PORT", "3001"),
		GinMode:                 getEnv("GIN_MODE", "debug"),
		CORSOrigin:              getEnv("CORS_ORIGIN", "http://localhost:3000"),
		RateLimitWindowSeconds:  getEnvAsInt("RATE_LIMIT_WINDOW_SECONDS", 900),
		RateLimitMaxRequests:    getEnvAsInt("RATE_LIMIT_MAX_REQUESTS", 100),
		MaxMessageLength:        getEnvAsInt("MAX_MESSAGE_LENGTH", 500),
		MaxMessagesHistory:      getEnvAsInt("MAX_MESSAGES_HISTORY", 1000),
		MaxUsersPerRoom:         getEnvAsInt("MAX_USERS_PER_ROOM", 100),
		UserTimeoutSeconds:      getEnvAsInt("USER_TIMEOUT_SECONDS", 300),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
