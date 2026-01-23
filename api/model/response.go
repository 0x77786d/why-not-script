package model

import "strings"

type APIResponse struct {
	Success   bool   `json:"success"`
	Msg       string `json:"msg"`
	ErrorCode int    `json:"errorCode"`
	Data      any    `json:"data"`
}

func Success(data any) APIResponse {
	return APIResponse{
		Success:   true,
		Msg:       "success",
		ErrorCode: 0,
		Data:      normalizeData(data),
	}
}

func Error(msg string) APIResponse {
	if msg == "" {
		msg = "error"
	}
	return APIResponse{
		Success:   false,
		Msg:       msg,
		ErrorCode: -1,
		Data:      nil,
	}
}

func normalizeData(data any) any {
	switch v := data.(type) {
	case map[string]any:
		out := make(map[string]any, len(v))
		for key, value := range v {
			out[toCamelCase(key)] = normalizeData(value)
		}
		return out
	case map[string]string:
		out := make(map[string]any, len(v))
		for key, value := range v {
			out[toCamelCase(key)] = normalizeData(value)
		}
		return out
	case []map[string]any:
		out := make([]any, 0, len(v))
		for _, item := range v {
			out = append(out, normalizeData(item))
		}
		return out
	case []map[string]string:
		out := make([]any, 0, len(v))
		for _, item := range v {
			out = append(out, normalizeData(item))
		}
		return out
	case []any:
		out := make([]any, len(v))
		for i, item := range v {
			out[i] = normalizeData(item)
		}
		return out
	default:
		return data
	}
}

func toCamelCase(value string) string {
	if !strings.Contains(value, "_") {
		return value
	}
	parts := strings.Split(value, "_")
	if len(parts) == 0 {
		return value
	}
	result := parts[0]
	for _, part := range parts[1:] {
		if part == "" {
			continue
		}
		result += strings.ToUpper(part[:1]) + part[1:]
	}
	return result
}
