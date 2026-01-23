package store

import (
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

type LogStore struct {
	basePath string
}

func NewLogStore() *LogStore {
	basePath := filepath.Join(AppDataDir(), "logs")
	_ = os.MkdirAll(basePath, 0o755)
	return &LogStore{basePath: basePath}
}

func (l *LogStore) logPath(id int) string {
	return filepath.Join(l.basePath, fmt.Sprintf("%d.log", id))
}

func (l *LogStore) ReadLogs(id int, n int) []string {
	if n <= 0 {
		n = 100
	}
	path := l.logPath(id)
	file, err := os.Open(path)
	if err != nil {
		return []string{}
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil || info.Size() == 0 {
		return []string{}
	}

	const blockSize int64 = 1024
	var data []byte
	var lines [][]byte
	remaining := info.Size()

	for len(lines) < n && remaining > 0 {
		readSize := blockSize
		if remaining < readSize {
			readSize = remaining
		}
		remaining -= readSize
		_, err = file.Seek(remaining, io.SeekStart)
		if err != nil {
			return []string{}
		}
		buf := make([]byte, readSize)
		_, err = file.Read(buf)
		if err != nil && err != io.EOF {
			return []string{}
		}
		data = append(buf, data...)
		lines = bytes.Split(data, []byte("\n"))
		if len(lines) > 0 && len(lines[len(lines)-1]) == 0 {
			lines = lines[:len(lines)-1]
		}
	}

	if len(lines) == 0 {
		return []string{}
	}
	start := 0
	if len(lines) > n {
		start = len(lines) - n
	}

	result := make([]string, 0, len(lines)-start)
	for _, line := range lines[start:] {
		result = append(result, string(line))
	}
	return result
}

func (l *LogStore) WriteLog(id int, content string) {
	path := l.logPath(id)
	_ = os.MkdirAll(l.basePath, 0o755)
	timestamp := time.Now().Format("15:04:05")
	line := fmt.Sprintf("[%s] %s\n", timestamp, content)
	file, err := os.OpenFile(path, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer file.Close()
	_, _ = file.WriteString(line)
}

func (l *LogStore) DeleteLog(id int) {
	path := l.logPath(id)
	_ = os.Remove(path)
}
