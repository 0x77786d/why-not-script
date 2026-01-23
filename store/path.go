package store

import (
	"os"
	"path/filepath"
)

func AppDataDir() string {
	base := os.Getenv("APPDATA")
	if base == "" {
		fallback, err := os.UserConfigDir()
		if err == nil && fallback != "" {
			base = fallback
		} else {
			base = "."
		}
	}
	path := filepath.Join(base, "why-not-script.exe")
	_ = os.MkdirAll(path, 0o755)
	return path
}
