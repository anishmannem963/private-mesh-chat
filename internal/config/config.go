package config

import (
	"log"
	"os"
	"path/filepath"
	"runtime"

	"sync"

	"github.com/joho/godotenv"
)

var loadOnce sync.Once

// LoadEnv loads the .env file once, safely
func LoadEnv() {
	loadOnce.Do(func() {
		// Find the root directory of the project (module) dynamically
		_, b, _, _ := runtime.Caller(0)

		// Go up 2 levels to the root directory
		basePath := filepath.Join(filepath.Dir(b), "../../")

		// Define the absolute path to the .env file
		envPath := filepath.Join(basePath, ".env")

		// Try loading the .env file from the root directory
		err := godotenv.Load(envPath)
		if err != nil {
			log.Println(".env file not found or failed to load, falling back to OS environment")
		}
	})
}

// GetEnv fetches an env variable and optionally returns a default
func GetEnv(key string, fallback ...string) string {
	val := os.Getenv(key)
	if val == "" && len(fallback) > 0 {
		return fallback[0]
	}
	return val
}
