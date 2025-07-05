package config

import (
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	Port        string
}

func LoadConfig() *Config {
	return &Config{
		DatabaseURL: getEnvOrDefault("DATABASE_URL", "postgres://user:password@localhost/aa_sharing?sslmode=disable"),
		JWTSecret:   getEnvOrDefault("JWT_SECRET", "your-secret-key"),
		Port:        getEnvOrDefault("PORT", "8080"),
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}