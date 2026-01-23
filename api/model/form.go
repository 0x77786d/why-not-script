package model

type LoginForm struct {
	LoginType int    `json:"login_type"`
	User      string `json:"user"`
	Pwd       string `json:"pwd"`
	Token     string `json:"token"`
}

type CourseSearchForm struct {
	Keyword string `json:"keyword"`
}

type QueueAddForm struct {
	Data map[string]any `json:"data"`
}

type QueueDeleteForm struct {
	ID int `json:"id"`
}

type QueueStatusForm struct {
	ID     int    `json:"id"`
	Status string `json:"status"`
}

type QueueLogForm struct {
	ID int `json:"id"`
}
